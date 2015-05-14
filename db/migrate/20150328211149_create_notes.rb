class CreateNotes < ActiveRecord::Migration
  def change
    create_table :notes do |t|
      t.string :body
      t.string :pic
      t.float :lat
      t.float :lng
      t.belongs_to :user
    end
  end
end
