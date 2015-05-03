class CreateNotes < ActiveRecord::Migration
  def change
    create_table :notes do |t|
      t.string :body
      t.integer :lat
      t.integer :lng
      t.belongs_to :user
    end
  end
end
