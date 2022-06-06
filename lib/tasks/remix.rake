require 'action_dispatch/routing/inspector'

namespace :remix do
  desc "generate remix routes"
  task routes: :environment do
    routes = RemixRoutesInspector.new(Rails.application.routes.routes).as_json

    Rails.root
      .join('app/frontend/routes.json')
      .write(routes.to_json)
  end
end

class RemixRoutesInspector
  class RouteWrapper < ActionDispatch::Routing::RouteWrapper
    def internal?
      super || path.start_with?('/rails') || name.start_with?('turbo_')
    end

    def path
      @path ||= super.gsub(/\(\.:format\)/, '')
    end

    def loader?
      verb == 'GET' || verb == 'HEAD'
    end

    def action?
      !loader?
    end
  end

  def initialize(routes)
    @engines = {}
    @routes = routes
  end

  def as_json
    collect_routes(@routes)
  end

  private

  def collect_routes(routes)
    routes.map do |route|
      RouteWrapper.new(route)
    end.reject(&:internal?).group_by(&:path).map do |path, routes|
      {
        id: routes.map(&:name).filter(&:present?).first,
        path: path,
        handle: {
          _loader: routes.any?(&:loader?),
          _action: routes.any?(&:action?)
        }
      }
    end
  end

  def collect_engine_routes(route)
    name = route.endpoint
    return unless route.engine?
    return if @engines[name]

    routes = route.rack_app.routes
    if routes.is_a?(ActionDispatch::Routing::RouteSet)
      @engines[name] = collect_routes(routes.routes)
    end
  end
end
