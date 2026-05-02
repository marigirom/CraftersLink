# CraftersLink

**Connecting Kenyan Interior Designers with Local Artisans**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![Django 5.0](https://img.shields.io/badge/django-5.0-darkgreen.svg)](https://www.djangoproject.com/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://react.dev/)

---

## 🎯 Project Overview

CraftersLink is a professional marketplace platform that bridges the gap between Kenyan interior designers and local artisans. It transforms informal, undocumented transactions into a structured workflow featuring:

- 🔍 **Artisan Discovery** - Browse artisans by county, craft specialty, and ratings
- 🎨 **Product Catalogue** - Explore diverse crafts from Kisii soapstone to Maasai beadwork
- 📋 **Commission Management** - Request custom work with detailed briefs and budgets
- 📊 **Milestone Tracking** - Monitor project progress from sourcing to delivery
- 💰 **KES-Denominated Invoicing** - Professional PDF invoices with VAT calculations
- ☁️ **IBM Cloud Integration** - Secure file storage and management

**Built for:** IBM Watsonx Challenge Hackathon (48-hour build)  
**Showcasing:** IBM Bob across the entire Software Development Life Cycle (SDLC)

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Django 5.0 + Django REST Framework
- PostgreSQL 16
- JWT Authentication
- IBM Cloud Object Storage
- ReportLab (PDF generation)

**Frontend:**
- React 18 + TypeScript
- Vite
- IBM Carbon Design System
- Axios
- React Router v6

**DevOps:**
- Docker + docker-compose
- Nginx
- GitHub Actions (CI/CD)

### Project Structure

```
CraftersLink/
├── backend/                 # Django REST API
│   ├── apps/
│   │   ├── users/          # Authentication & user management
│   │   ├── artisans/       # Artisan profiles & products
│   │   ├── commissions/    # Commission workflow
│   │   └── invoices/       # Invoice generation
│   ├── crafterslink/       # Django project settings
│   └── requirements.txt
│
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level pages
│   │   ├── services/      # API integration
│   │   └── context/       # State management
│   └── package.json
│
├── deploy/                 # Deployment configs
│   ├── docker-compose.yml
│   └── nginx/
│
├── docs/                   # Comprehensive documentation
│   ├── ARCHITECTURE.md
│   ├── API_SPECIFICATION.md
│   ├── DATA_MODELS.md
│   ├── DEPLOYMENT.md
│   ├── SETUP_GUIDE.md
│   ├── SDLC_WITH_BOB.md
│   └── IBM_CLOUD_INTEGRATION.md
│
└── bob-report/            # IBM Bob session exports
    └── SDLC_REPORT.md
```

---

## 🚀 Quick Start

### Prerequisites

- Docker 24.0+ and Docker Compose 2.20+
- IBM Cloud Object Storage account
- Git

### Setup (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/crafterslink.git
cd crafterslink

# 2. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your IBM COS credentials
nano backend/.env

# 3. Start all services
cd deploy
docker-compose up -d

# 4. Initialize database
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py seed_data

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/v1
# Admin Panel: http://localhost:8000/admin
```

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

| Document | Description |
|----------|-------------|
| [**Architecture**](docs/ARCHITECTURE.md) | System design, tech stack, and folder structure |
| [**Data Models**](docs/DATA_MODELS.md) | Database schema and model specifications |
| [**API Specification**](docs/API_SPECIFICATION.md) | Complete REST API documentation |
| [**IBM Cloud Integration**](docs/IBM_CLOUD_INTEGRATION.md) | Object Storage setup and usage |
| [**Database Schema**](docs/diagrams/database-schema.md) | ER diagrams and relationships |
| [**SDLC with Bob**](docs/SDLC_WITH_BOB.md) | IBM Bob usage across development phases |
| [**Deployment Guide**](docs/DEPLOYMENT.md) | Docker and production deployment |
| [**Setup Guide**](docs/SETUP_GUIDE.md) | Local development environment setup |

---

## 🎨 Key Features

### For Interior Designers

✅ **Discover Artisans**
- Search by county (47 Kenyan counties)
- Filter by craft specialty (soapstone, beadwork, furniture, etc.)
- View ratings and completed commissions
- Browse artisan portfolios

✅ **Commission Custom Work**
- Request custom pieces with detailed briefs
- Attach reference images and sketches
- Set budget in Kenyan Shillings (KES)
- Specify delivery timelines

✅ **Track Progress**
- Real-time milestone updates
- View progress photos from artisans
- Receive notifications on status changes
- Monitor delivery timelines

✅ **Professional Invoicing**
- Auto-generated PDF invoices
- VAT calculations (16%)
- Email delivery
- Payment tracking

### For Artisans

✅ **Showcase Work**
- Create detailed product listings
- Upload high-quality images to IBM COS
- Specify materials, dimensions, and pricing
- Mark items as in-stock or commissionable

✅ **Manage Commissions**
- Accept or reject commission requests
- Set agreed delivery dates
- Update milestone progress
- Upload work-in-progress photos

✅ **Generate Invoices**
- Automatic invoice creation on completion
- Professional PDF templates
- Email to designers
- Track payment status

---

## 🔧 Development

### Local Development Setup

See the comprehensive [**Setup Guide**](docs/SETUP_GUIDE.md) for detailed instructions.

**Quick commands:**

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev

# Run tests
python manage.py test
npm run test
```

### API Endpoints

**Authentication:**
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - Login with JWT
- `POST /api/v1/auth/refresh/` - Refresh access token

**Artisans & Products:**
- `GET /api/v1/artisans/` - List artisans (with filters)
- `GET /api/v1/products/` - List products (with search)
- `POST /api/v1/products/` - Create product (artisan only)

**Commissions:**
- `POST /api/v1/commissions/` - Create commission (designer only)
- `PATCH /api/v1/commissions/{id}/accept/` - Accept commission
- `GET /api/v1/commissions/{id}/milestones/` - View milestones

**Invoices:**
- `POST /api/v1/invoices/` - Generate invoice
- `GET /api/v1/invoices/{id}/pdf/` - Download PDF

See [**API Specification**](docs/API_SPECIFICATION.md) for complete documentation.

---

## 🤖 IBM Bob Integration

This project demonstrates comprehensive usage of IBM Bob across the entire SDLC:

### Planning Phase (📝 Plan Mode)
- Architecture design and data modeling
- API endpoint planning
- Technical decision documentation
- Database schema design

### Implementation Phase (💻 Code Mode)
- Django backend scaffolding
- React frontend development
- API endpoint implementation
- Component creation

### Advanced Features (🛠️ Advanced Mode)
- PDF invoice generation with ReportLab
- Email notification system
- IBM Cloud Object Storage integration

### Review & Optimization (❓ Ask Mode)
- Code review and security analysis
- Performance optimization
- Debugging assistance
- Best practices validation

**Session Exports:** All Bob interactions are documented in [`bob-report/`](bob-report/) for hackathon submission.

See [**SDLC with Bob**](docs/SDLC_WITH_BOB.md) for detailed workflow documentation.

---

## 🗄️ Database Schema

### Core Models

**User** → Custom user model with ARTISAN/DESIGNER roles  
**ArtisanProfile** → Extended profile for artisans (county, craft, portfolio)  
**Product** → Artisan products (in-stock or commissionable)  
**Commission** → Designer-to-Artisan commission requests  
**Milestone** → Project tracking stages (Sourcing → In Progress → Delivered)  
**Invoice** → Auto-generated KES-denominated invoices with PDF

See [**Database Schema**](docs/diagrams/database-schema.md) for ER diagrams and relationships.

---

## 🌍 Kenyan Context

### Supported Counties (47)
Nairobi, Mombasa, Kisumu, Nakuru, Kiambu, Kisii, Lamu, Kajiado, Machakos, Kilifi, and 37 more.

### Craft Specialties
- **Kisii Soapstone Carving** - Traditional stone sculptures
- **Lamu Furniture** - Coastal woodwork and furniture
- **Maasai Beadwork** - Colorful traditional jewelry
- **Woven Baskets** - Sisal and palm baskets
- **Pottery & Ceramics** - Traditional and modern pottery
- **Wood Carving** - Decorative and functional pieces
- **Metal Crafts** - Jewelry and decorative items

### Currency
All pricing and invoicing in **Kenyan Shillings (KES)** with 16% VAT.

---

## 🚢 Deployment

### Docker Deployment

```bash
# Production deployment
cd deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

### IBM Cloud Deployment

```bash
# Deploy to IBM Code Engine
ibmcloud ce project create --name crafterslink
ibmcloud ce application create --name crafterslink-backend \
  --image us.icr.io/crafterslink/backend:latest

# Deploy to Cloud Foundry
ibmcloud cf push crafterslink-backend
```

See [**Deployment Guide**](docs/DEPLOYMENT.md) for complete instructions.

---

## 🧪 Testing

```bash
# Backend tests
python manage.py test
coverage run --source='.' manage.py test
coverage report

# Frontend tests
npm run test
npm run test:coverage

# E2E tests
npm run test:e2e
```

---

## 📊 Project Timeline

**48-Hour Hackathon Build:**

| Phase | Hours | Activities |
|-------|-------|------------|
| Planning | 0-4 | Architecture, data modeling, API design |
| Backend Core | 4-16 | Django setup, models, authentication, API |
| Frontend | 16-28 | React setup, components, API integration |
| Advanced Features | 28-36 | PDF generation, email, IBM COS |
| Testing & Polish | 36-44 | Testing, bug fixes, optimization |
| Documentation | 44-48 | Docs, deployment, Bob session export |

---

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Project Lead:** [Your Name]  
**Built with:** IBM Bob AI Assistant  
**For:**  IBM Watsonx Challenge Hackathon  
**Timeline:** 48 hours  

---

## 🙏 Acknowledgments

- **IBM Cloud** for Object Storage services
- **IBM Bob** for AI-assisted development
- **Kenyan Artisan Community** for inspiration
- **Carbon Design System** for UI components
- **Django & React Communities** for excellent frameworks

---

## 📞 Support

For questions or support:

- 📧 Email: support@crafterslink.com
- 📖 Documentation: [`docs/`](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/crafterslink/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/crafterslink/discussions)

---

**CraftersLink** - *Bridging tradition with technology, connecting Kenya's creative economy.*