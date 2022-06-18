class Todo < ApplicationRecord
  validates :title, presence: true

  def validating?
    created_at > 20.seconds.ago
  end

  def validated?
    created_at < 10.seconds.ago
  end
end
