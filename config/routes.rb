Rails.application.routes.draw do
  resources :users
  root to: 'visitors#index'
  get '/auth/:provider/callback' => 'sessions#create'
  get '/signin' => 'sessions#new', :as => :signin
  get '/signout' => 'sessions#destroy', :as => :signout
  get '/auth/failure' => 'sessions#failure'

  resources :notes, only: [:create, :show, :destroy] do
    collection do
      get :near
    end
  end
  mount SseRailsEngine::Engine, at: '/sse'
end
