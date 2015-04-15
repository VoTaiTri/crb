Rails.application.routes.draw do
  devise_for :users

  root 'pages#home'
  get 'help' => 'pages#help'

  namespace :admin do
  end

  resources :schedules, only: [:new, :create, :edit, :update]

end