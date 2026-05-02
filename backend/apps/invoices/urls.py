from django.urls import path
from .views import (
    InvoiceListView,
    InvoiceDetailView,
    InvoiceCreateView,
    InvoiceUpdateView,
    InvoiceSendView,
    InvoicePaymentView,
    InvoiceDownloadPDFView,
)

app_name = 'invoices'

urlpatterns = [
    path('', InvoiceListView.as_view(), name='invoice-list'),
    path('create/', InvoiceCreateView.as_view(), name='invoice-create'),
    path('<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('<int:pk>/update/', InvoiceUpdateView.as_view(), name='invoice-update'),
    path('<int:pk>/send/', InvoiceSendView.as_view(), name='invoice-send'),
    path('<int:pk>/pay/', InvoicePaymentView.as_view(), name='invoice-pay'),
    path('<int:pk>/download/', InvoiceDownloadPDFView.as_view(), name='invoice-download'),
]

# Made with Bob