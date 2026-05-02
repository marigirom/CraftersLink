from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO
from django.utils import timezone


class InvoicePDFGenerator:
    """Generate professional PDF invoices using ReportLab"""
    
    def __init__(self, invoice):
        self.invoice = invoice
        self.buffer = BytesIO()
        self.width, self.height = A4
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='InvoiceTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0284c7'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='InvoiceHeader',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#374151'),
            spaceAfter=12
        ))
        
        self.styles.add(ParagraphStyle(
            name='InvoiceLabel',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=4
        ))
        
        self.styles.add(ParagraphStyle(
            name='InvoiceValue',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#111827'),
            spaceAfter=12
        ))
    
    def _format_currency(self, amount):
        """Format amount as KES currency"""
        return f"KES {amount:,.2f}"
    
    def _format_date(self, date):
        """Format date"""
        return date.strftime('%d %B %Y')
    
    def generate(self):
        """Generate the PDF invoice"""
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        story = []
        
        # Add invoice title
        story.append(Paragraph("INVOICE", self.styles['InvoiceTitle']))
        story.append(Spacer(1, 0.2 * inch))
        
        # Add invoice details header
        header_data = [
            [
                Paragraph(f"<b>Invoice Number:</b> {self.invoice.invoice_number}", self.styles['InvoiceHeader']),
                Paragraph(f"<b>Issue Date:</b> {self._format_date(self.invoice.issue_date)}", self.styles['InvoiceHeader'])
            ],
            [
                Paragraph(f"<b>Due Date:</b> {self._format_date(self.invoice.due_date)}", self.styles['InvoiceHeader']),
                Paragraph(f"<b>Status:</b> {self.invoice.get_status_display()}", self.styles['InvoiceHeader'])
            ]
        ]
        
        header_table = Table(header_data, colWidths=[3.5*inch, 3.5*inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 0.3 * inch))
        
        # Add billing information
        billing_data = [
            [
                Paragraph("<b>From (Artisan):</b>", self.styles['InvoiceLabel']),
                Paragraph("<b>To (Designer):</b>", self.styles['InvoiceLabel'])
            ],
            [
                Paragraph(
                    f"{self.invoice.commission.artisan.user.get_full_name()}<br/>"
                    f"{self.invoice.commission.artisan.business_name or ''}<br/>"
                    f"{self.invoice.commission.artisan.town}, {self.invoice.commission.artisan.get_county_display()}<br/>"
                    f"{self.invoice.commission.artisan.user.email}",
                    self.styles['InvoiceValue']
                ),
                Paragraph(
                    f"{self.invoice.commission.designer.get_full_name()}<br/>"
                    f"{self.invoice.commission.designer.email}<br/>"
                    f"{self.invoice.commission.designer.phone_number or ''}",
                    self.styles['InvoiceValue']
                )
            ]
        ]
        
        billing_table = Table(billing_data, colWidths=[3.5*inch, 3.5*inch])
        billing_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(billing_table)
        story.append(Spacer(1, 0.4 * inch))
        
        # Add line items table
        line_items_data = [
            ['Description', 'Quantity', 'Unit Price', 'Total']
        ]
        
        for item in self.invoice.line_items:
            line_items_data.append([
                item['description'],
                str(item['quantity']),
                self._format_currency(item['unit_price']),
                self._format_currency(item['total'])
            ])
        
        line_items_table = Table(line_items_data, colWidths=[3.5*inch, 1*inch, 1.5*inch, 1.5*inch])
        line_items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]))
        story.append(line_items_table)
        story.append(Spacer(1, 0.3 * inch))
        
        # Add totals
        totals_data = [
            ['', '', 'Subtotal:', self._format_currency(self.invoice.subtotal_kes)],
            ['', '', f'VAT ({self.invoice.tax_percentage}%):', self._format_currency(self.invoice.tax_amount_kes)],
            ['', '', 'Total:', self._format_currency(self.invoice.total_kes)]
        ]
        
        totals_table = Table(totals_data, colWidths=[3.5*inch, 1*inch, 1.5*inch, 1.5*inch])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (2, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (2, 0), (-1, -1), 10),
            ('LINEABOVE', (2, 2), (-1, 2), 2, colors.HexColor('#0284c7')),
            ('TOPPADDING', (2, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (2, 0), (-1, -1), 8),
        ]))
        story.append(totals_table)
        story.append(Spacer(1, 0.4 * inch))
        
        # Add payment information if paid
        if self.invoice.status == 'PAID' and self.invoice.paid_date:
            payment_info = Paragraph(
                f"<b>Payment Received:</b> {self._format_date(self.invoice.paid_date.date())}<br/>"
                f"<b>Payment Method:</b> {self.invoice.payment_method}<br/>"
                f"<b>Reference:</b> {self.invoice.payment_reference}",
                self.styles['InvoiceValue']
            )
            story.append(payment_info)
            story.append(Spacer(1, 0.3 * inch))
        
        # Add notes if present
        if self.invoice.notes:
            story.append(Paragraph("<b>Notes:</b>", self.styles['InvoiceLabel']))
            story.append(Paragraph(self.invoice.notes, self.styles['InvoiceValue']))
            story.append(Spacer(1, 0.2 * inch))
        
        # Add terms and conditions if present
        if self.invoice.terms_and_conditions:
            story.append(Paragraph("<b>Terms and Conditions:</b>", self.styles['InvoiceLabel']))
            story.append(Paragraph(self.invoice.terms_and_conditions, self.styles['InvoiceValue']))
        else:
            # Default terms
            default_terms = (
                "Payment is due within 30 days of invoice date. "
                "Late payments may incur additional charges. "
                "Please include the invoice number with your payment."
            )
            story.append(Paragraph("<b>Terms and Conditions:</b>", self.styles['InvoiceLabel']))
            story.append(Paragraph(default_terms, self.styles['InvoiceValue']))
        
        story.append(Spacer(1, 0.4 * inch))
        
        # Add footer
        footer = Paragraph(
            f"<i>Generated by CraftersLink on {timezone.now().strftime('%d %B %Y at %H:%M')}</i>",
            ParagraphStyle(
                name='Footer',
                parent=self.styles['Normal'],
                fontSize=8,
                textColor=colors.HexColor('#9ca3af'),
                alignment=TA_CENTER
            )
        )
        story.append(footer)
        
        # Build PDF
        doc.build(story)
        
        # Get PDF content
        pdf_content = self.buffer.getvalue()
        self.buffer.close()
        
        return pdf_content


def generate_invoice_pdf(invoice):
    """Helper function to generate invoice PDF"""
    generator = InvoicePDFGenerator(invoice)
    return generator.generate()


# Made with Bob