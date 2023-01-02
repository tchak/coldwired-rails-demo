require 'action_dispatch/routing/inspector'

namespace :coldwired do
  desc "generate coldwired routes"
  task routes: :environment do
    routes = ColdwiredRoutesInspector.new(Rails.application.routes.routes).as_json

    Rails.root
      .join('app/frontend/routes.json')
      .write(JSON.pretty_generate(routes))
  end
end

class ColdwiredRoutesInspector
  class RouteWrapper < ActionDispatch::Routing::RouteWrapper
    def internal?
      super || path.start_with?('/rails') || name.start_with?('turbo_')
    end

    def path
      @path ||= super.gsub(/\(\.:format\)/, '')
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
        id: routes.map(&:name).filter(&:present?).first || SecureRandom.uuid,
        path: path,
        handle: { method: routes.map(&:verb).map(&:downcase) }
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
