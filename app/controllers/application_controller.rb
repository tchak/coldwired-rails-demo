class ApplicationController < ActionController::Base
  def redirect_to(url)
    if request.headers['x-remix'].present?
      headers['x-remix-redirect'] = url
      head :no_content
    else
      super
    end
  end
end
