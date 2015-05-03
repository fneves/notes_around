class NotesController < ApplicationController
  before_action :find_note, only: [:show]
  include Tubesock::Hijack

  rescue_from ActiveRecord::RecordNotFound do
    render json: { errors: ["Could not find note with id #{params[:id]}"] }
  end

  def create
    @note = Note.new(secure_params)
    if @note.save
      render json: { note: @note }
    else
      render json: { errors: @note.errors }, status: 400
    end
  end

  def show
    render json: { note: @note }
  end

  def near
    notes = Note.within(5, origin: origin).includes(:user)
    render json: { notes: notes }
  end

  def live
    hijack do |tubesock|
      tubesock.onopen do
        tubesock.send_data "Hello, friend"
      end

      tubesock.onmessage do |data|
        Rails.logger.info("received #{data}")
        @note = Note.new(JSON.parse(data))
        tubesock.send_data(data) if @note.save
      end
    end
  end

  private

  def find_note
    @note = Note.find(params[:id])
  end

  def origin
    [location_params[:lat], location_params[:lng]]
  end

  def secure_params
    params.require(:note).permit(:body, :lat, :lng)
  end

  def location_params
    params.permit(:lat, :lng)
  end
end
