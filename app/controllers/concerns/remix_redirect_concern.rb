module RemixRedirectConcern
  extend ActiveSupport::Concern

  def redirect_to(options = {}, response_options = {})
    if remix?
      remix_redirect_to(options, response_options)
    else
      super
    end
  end

  def remix?
    request.headers['x-requested-with'] == 'remix'
  end

  private

  def remix_redirect_to(options = {}, response_options = {})
    raise ActionControllerError.new("Cannot redirect to nil!") unless options
    raise AbstractController::DoubleRenderError if response_body
  
    allow_other_host = response_options.delete(:allow_other_host) { _allow_other_host }
  
    headers['x-remix-redirect'] = _enforce_open_redirect_protection(_compute_redirect_to_location(request, options), allow_other_host: allow_other_host)
    head :no_content
  end
end
