const express = require('express');
const ejs = require('ejs');
const htmlPdf = require('html-pdf');
const path = require('path');
const fs = require('fs');

// Initialize Express
const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// Route for generating the invoice and downloading the PDF
app.get('/invoice', (req, res) => {
  // Read logo file and convert to base64
  const logoPath = path.join(__dirname, 'public', 'images', 'taskberry-blue.svg');
  fs.readFile(logoPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading logo file:', err);
      return res.status(500).send('Error loading logo.');
    }

    // Convert SVG to Base64
    const base64Logo = Buffer.from(data).toString('base64');

    // Invoice data
    const invoiceData = {
      companyName: 'My Company',
      companyAddress: '123 Business St, Business City',
      companyPhone: '(123) 456-7890',
      companyEmail: 'contact@mycompany.com',
      invoiceNumber: 'INV-123456',
      invoiceDate: '2024-11-06',
      dueDate: '2024-11-20',
      customerName: 'John Doe',
      customerAddress: '456 Customer St, Customer City',
      customerPhone: '(987) 654-3210',
      customerEmail: 'john.doe@example.com',
      invoiceItems: [
        { name: 'Item 1', quantity: 2, price: '$50', total: '$100' },
        { name: 'Item 2', quantity: 1, price: '$75', total: '$75' }
      ],
      totalAmount: '$175',
      base64Logo: base64Logo // Pass the Base64 logo
    };
    

    // Render the invoice template
    ejs.renderFile(path.join(__dirname, 'views', 'invoice.ejs'), invoiceData, (err, htmlContent) => {
      if (err) {
        console.error('Error rendering EJS:', err);
        return res.status(500).send('Error rendering invoice.');
      }

      // Generate PDF from HTML content using html-pdf
      const options = {
        format: 'A4',
        border: '10mm',
        footer: {
          height: '15mm',
          contents: {
            default: '<span style="color: #444;">Invoice generated on <%= invoiceDate %></span>'
          }
        }
      };

      htmlPdf.create(htmlContent, options).toBuffer((err, pdfBuffer) => {
        if (err) {
          console.error('Error generating PDF:', err);
          return res.status(500).send('Error generating PDF.');
        }

        // Set headers to download the PDF
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=invoice.pdf'
        });

        // Send the PDF file as a response
        res.send(pdfBuffer);
      });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
