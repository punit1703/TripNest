from django.urls import path
from .views import AddExpenseView, TripExpensesView, ExpenseDetailView

urlpatterns = [
    path('add/', AddExpenseView.as_view(), name='add-expense'),
    path('trip/<int:trip_id>/', TripExpensesView.as_view(), name='trip-expenses'),
    path('<int:pk>/', ExpenseDetailView.as_view(), name='delete-expense'),
]
