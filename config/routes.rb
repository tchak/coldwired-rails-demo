Rails.application.routes.draw do
  root "todos#index"
  get "about", to: "todos#about"

  resources :todos, only: [:create, :update, :destroy]
end
