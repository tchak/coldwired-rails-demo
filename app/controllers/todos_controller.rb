class TodosController < ApplicationController
  def index
    render json: {
      todos: Todo.order(:created_at).all,
      csrf: form_authenticity_token,
      errors: flash[:errors]
    }
  end

  def create
    todo = Todo.new(create_params)

    if !todo.save
      flash[:errors] = todo.errors.full_messages
    end

    redirect_to root_path
  end

  def update
    todo = Todo.find(params[:id])

    if !todo.update(update_params)
      flash[:errors] = todo.errors.full_messages
    end

    redirect_to root_path
  end

  def destroy
    todo = Todo.find(params[:id])
    todo.destroy

    redirect_to root_path
  end

  def about
  end

  private

  def create_params
    params.require(:todo).permit(:title)
  end

  def update_params
    params.require(:todo).permit(:title, :completed)
  end
end
