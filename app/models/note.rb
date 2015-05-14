class Note < ActiveRecord::Base
  belongs_to :user
  acts_as_mappable
  before_save :fetch_picture

  def fetch_picture
    self.pic = Giphy.random(self.body).image_url.to_s
  end
end
