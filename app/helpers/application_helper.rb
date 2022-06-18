module ApplicationHelper
  def input_classes(classes = '')
    "shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md px-1.5 py-1 #{classes}"
  end

  def checkbox_classes(classes = '')
    "focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded #{classes}"
  end

  def button_classes(classes = '')
    "inline-flex items-center border shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 border-transparent text-white bg-blue-600 text-xs rounded px-2.5 py-1.5 #{classes}"
  end

  def item_classes(classes = '')
    "flex items-center justify-between mb-2 border border-1 rounded border-gray-200 #{classes}"
  end
end
