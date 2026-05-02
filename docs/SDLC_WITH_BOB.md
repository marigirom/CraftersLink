# CraftersLink - SDLC Workflow with IBM Bob

## Overview
This document outlines how IBM Bob will be utilized across the entire Software Development Life Cycle (SDLC) for the CraftersLink project during the 48-hour hackathon build.

---

## Bob Modes Overview

### Available Modes

| Mode | Slug | Purpose | Key Use Cases |
|------|------|---------|---------------|
| **📝 Plan** | `plan` | Architecture & Planning | Design, data modeling, API planning, documentation |
| **💻 Code** | `code` | Implementation | Writing code, creating files, basic features |
| **🛠️ Advanced** | `advanced` | Complex Features | MCP tools, browser automation, advanced integrations |
| **❓ Ask** | `ask` | Analysis & Review | Code review, debugging, explanations, optimization |
| **🔀 Orchestrator** | `orchestrator` | Multi-task Coordination | Breaking down complex tasks, managing workflows |

---

## Phase 1: Planning & Architecture (Hours 0-4)

### Mode: 📝 Plan Mode

**Objectives:**
- Define project architecture
- Design database schema
- Plan API endpoints
- Create technical specifications

**Bob Activities:**

1. **Architecture Design**
   ```
   Task: "Create comprehensive architecture for CraftersLink marketplace"
   
   Bob Actions:
   - Analyze requirements
   - Design monorepo structure
   - Define technology stack
   - Create folder organization
   - Document design decisions
   
   Deliverables:
   - docs/ARCHITECTURE.md
   - docs/DATA_MODELS.md
   - docs/API_SPECIFICATION.md
   ```

2. **Data Modeling**
   ```
   Task: "Design Django models for User, Artisan, Product, Commission, Invoice"
   
   Bob Actions:
   - Define model fields and relationships
   - Plan database indexes
   - Document business rules
   - Create ER diagrams
   
   Deliverables:
   - Detailed model specifications
   - Relationship diagrams
   - Validation rules
   ```

3. **API Planning**
   ```
   Task: "Map out REST API endpoints for the platform"
   
   Bob Actions:
   - Define endpoint structure
   - Document request/response formats
   - Plan authentication flow
   - Design error handling
   
   Deliverables:
   - Complete API documentation
   - Authentication strategy
   - Error response formats
   ```

**Session Export:**
- Export all planning conversations
- Save to `bob-report/01-plan-mode/`
- Document key decisions made

---

## Phase 2: Backend Foundation (Hours 4-16)

### Mode: 💻 Code Mode

**Objectives:**
- Set up Django project
- Implement data models
- Create authentication system
- Build core API endpoints

**Bob Activities:**

1. **Project Initialization (Hours 4-6)**
   ```
   Task: "Initialize Django project with PostgreSQL and JWT authentication"
   
   Bob Actions:
   - Create Django project structure
   - Configure settings.py
   - Set up database connection
   - Install required packages
   - Create requirements.txt
   
   Files Created:
   - backend/crafterslink/settings.py
   - backend/crafterslink/urls.py
   - backend/requirements.txt
   - backend/manage.py
   ```

2. **User & Authentication (Hours 6-8)**
   ```
   Task: "Implement custom User model with ARTISAN/DESIGNER roles and JWT auth"
   
   Bob Actions:
   - Create apps/users/ app
   - Implement User model
   - Create serializers
   - Build auth endpoints
   - Add JWT configuration
   
   Files Created:
   - backend/apps/users/models.py
   - backend/apps/users/serializers.py
   - backend/apps/users/views.py
   - backend/apps/users/urls.py
   ```

3. **Artisan & Product Models (Hours 8-10)**
   ```
   Task: "Create ArtisanProfile and Product models with filtering"
   
   Bob Actions:
   - Create apps/artisans/ app
   - Implement models
   - Add django-filter integration
   - Create CRUD endpoints
   - Add search functionality
   
   Files Created:
   - backend/apps/artisans/models.py
   - backend/apps/artisans/serializers.py
   - backend/apps/artisans/views.py
   - backend/apps/artisans/filters.py
   ```

4. **Commission System (Hours 10-14)**
   ```
   Task: "Implement Commission and Milestone models with workflow"
   
   Bob Actions:
   - Create apps/commissions/ app
   - Implement models
   - Add Django signals for auto-milestones
   - Create lifecycle endpoints
   - Add permission classes
   
   Files Created:
   - backend/apps/commissions/models.py
   - backend/apps/commissions/serializers.py
   - backend/apps/commissions/views.py
   - backend/apps/commissions/signals.py
   ```

5. **IBM COS Integration (Hours 14-16)**
   ```
   Task: "Integrate IBM Cloud Object Storage for file uploads"
   
   Bob Actions:
   - Create storage service
   - Implement upload endpoints
   - Add image optimization
   - Configure bucket access
   
   Files Created:
   - backend/apps/common/services/storage_service.py
   - backend/apps/common/views.py
   - backend/apps/common/urls.py
   ```

**Session Export:**
- Export code implementation sessions
- Save to `bob-report/02-code-mode/backend/`
- Document implementation decisions

---

### Mode: ❓ Ask Mode (Interspersed)

**Use Cases During Backend Development:**

1. **Code Review**
   ```
   Task: "Review the Commission model relationships for N+1 query issues"
   
   Bob Actions:
   - Analyze model relationships
   - Identify potential performance issues
   - Suggest select_related/prefetch_related usage
   - Recommend index additions
   ```

2. **Debugging**
   ```
   Task: "Debug JWT token refresh not working properly"
   
   Bob Actions:
   - Analyze authentication flow
   - Check token configuration
   - Review middleware setup
   - Suggest fixes
   ```

3. **Optimization**
   ```
   Task: "Optimize product filtering queries for better performance"
   
   Bob Actions:
   - Analyze current query patterns
   - Suggest database indexes
   - Recommend caching strategy
   - Provide optimized code
   ```

**Session Export:**
- Save debugging sessions
- Document solutions found
- Export to `bob-report/03-ask-mode/backend-review/`

---

## Phase 3: Frontend Development (Hours 16-28)

### Mode: 💻 Code Mode

**Objectives:**
- Set up React + TypeScript
- Integrate Carbon Design System
- Build core UI components
- Implement API integration

**Bob Activities:**

1. **Frontend Initialization (Hours 16-18)**
   ```
   Task: "Initialize React + TypeScript + Vite with Carbon Design System"
   
   Bob Actions:
   - Create Vite project
   - Install dependencies
   - Configure TypeScript
   - Set up Carbon Design
   - Create folder structure
   
   Files Created:
   - frontend/package.json
   - frontend/tsconfig.json
   - frontend/vite.config.ts
   - frontend/src/App.tsx
   ```

2. **Authentication Flow (Hours 18-20)**
   ```
   Task: "Implement authentication with JWT token management"
   
   Bob Actions:
   - Create auth context
   - Build login/register forms
   - Implement token storage
   - Add protected routes
   - Create auth service
   
   Files Created:
   - frontend/src/context/AuthContext.tsx
   - frontend/src/services/auth.service.ts
   - frontend/src/pages/Login.tsx
   - frontend/src/pages/Register.tsx
   ```

3. **Product Catalogue (Hours 20-22)**
   ```
   Task: "Build product catalogue with filtering and search"
   
   Bob Actions:
   - Create product list component
   - Add filter sidebar
   - Implement search
   - Build product cards
   - Add pagination
   
   Files Created:
   - frontend/src/pages/ArtisanCatalogue.tsx
   - frontend/src/components/artisan/ArtisanCard.tsx
   - frontend/src/components/artisan/ProductGallery.tsx
   - frontend/src/services/product.service.ts
   ```

4. **Commission Flow (Hours 22-26)**
   ```
   Task: "Create commission request and tracking interface"
   
   Bob Actions:
   - Build commission form
   - Create milestone tracker
   - Add file upload
   - Implement status updates
   
   Files Created:
   - frontend/src/pages/CommissionFlow.tsx
   - frontend/src/components/designer/CommissionForm.tsx
   - frontend/src/components/designer/MilestoneTracker.tsx
   - frontend/src/services/commission.service.ts
   ```

5. **Dashboard (Hours 26-28)**
   ```
   Task: "Build role-based dashboards for designers and artisans"
   
   Bob Actions:
   - Create dashboard layout
   - Add commission list
   - Build statistics cards
   - Implement quick actions
   
   Files Created:
   - frontend/src/pages/Dashboard.tsx
   - frontend/src/components/common/StatCard.tsx
   - frontend/src/components/common/CommissionList.tsx
   ```

**Session Export:**
- Export frontend implementation sessions
- Save to `bob-report/02-code-mode/frontend/`

---

## Phase 4: Advanced Features (Hours 28-36)

### Mode: 🛠️ Advanced Mode

**Objectives:**
- Implement PDF invoice generation
- Set up email notifications
- Add complex integrations

**Bob Activities:**

1. **Invoice PDF Generation (Hours 28-32)**
   ```
   Task: "Build PDF invoice generation with ReportLab and IBM COS upload"
   
   Bob Actions:
   - Install ReportLab
   - Create PDF template
   - Implement data population
   - Add company branding
   - Upload to IBM COS
   - Generate pre-signed URLs
   
   Files Created:
   - backend/apps/invoices/models.py
   - backend/apps/invoices/pdf_generator.py
   - backend/apps/invoices/views.py
   - backend/apps/invoices/serializers.py
   ```

2. **Email Notification System (Hours 32-36)**
   ```
   Task: "Set up Django email backend with HTML templates"
   
   Bob Actions:
   - Configure email settings
   - Create HTML templates
   - Implement email service
   - Add notification triggers
   - Set up async queue
   
   Files Created:
   - backend/apps/common/services/email_service.py
   - backend/templates/emails/invoice_sent.html
   - backend/templates/emails/commission_accepted.html
   - backend/apps/commissions/tasks.py
   ```

**Session Export:**
- Export advanced feature sessions
- Save to `bob-report/04-advanced-mode/`
- Document integration challenges

---

### Mode: ❓ Ask Mode (Review)

**Use Cases:**

1. **Security Review**
   ```
   Task: "Review PDF generation for security vulnerabilities"
   
   Bob Actions:
   - Check input sanitization
   - Review file access controls
   - Validate IBM COS permissions
   - Suggest security improvements
   ```

2. **Performance Analysis**
   ```
   Task: "Analyze email sending performance and suggest optimization"
   
   Bob Actions:
   - Review current implementation
   - Suggest async processing
   - Recommend queue system
   - Provide optimization code
   ```

---

## Phase 5: Testing & Polish (Hours 36-44)

### Mode: 💻 Code Mode + ❓ Ask Mode

**Objectives:**
- End-to-end testing
- Bug fixes
- UI/UX improvements
- Performance optimization

**Bob Activities:**

1. **Testing (Hours 36-38)**
   ```
   Code Mode Task: "Create test cases for critical workflows"
   
   Bob Actions:
   - Write unit tests for models
   - Create API endpoint tests
   - Add integration tests
   - Test commission workflow
   
   Files Created:
   - backend/apps/users/tests.py
   - backend/apps/commissions/tests.py
   - backend/apps/invoices/tests.py
   ```

2. **Bug Fixing (Hours 38-40)**
   ```
   Ask Mode Task: "Debug commission status not updating correctly"
   
   Bob Actions:
   - Analyze signal handlers
   - Check transaction handling
   - Review state transitions
   - Provide fix
   ```

3. **UI Polish (Hours 40-42)**
   ```
   Code Mode Task: "Improve loading states and error handling"
   
   Bob Actions:
   - Add loading spinners
   - Implement error boundaries
   - Add toast notifications
   - Improve form validation
   ```

4. **Performance Optimization (Hours 42-44)**
   ```
   Ask Mode Task: "Optimize API response times"
   
   Bob Actions:
   - Analyze slow queries
   - Add database indexes
   - Implement caching
   - Optimize serializers
   ```

**Session Export:**
- Export testing and debugging sessions
- Save to `bob-report/05-testing-polish/`

---

## Phase 6: Documentation & Deployment (Hours 44-48)

### Mode: 📝 Plan Mode + 💻 Code Mode

**Objectives:**
- Complete documentation
- Prepare deployment
- Create demo data
- Export Bob sessions

**Bob Activities:**

1. **Documentation (Hours 44-45)**
   ```
   Plan Mode Task: "Create deployment guide and API documentation"
   
   Bob Actions:
   - Write deployment instructions
   - Document environment variables
   - Create setup guide
   - Add troubleshooting section
   
   Files Created:
   - docs/DEPLOYMENT.md
   - docs/SETUP_GUIDE.md
   - README.md (updated)
   ```

2. **Docker Configuration (Hours 45-46)**
   ```
   Code Mode Task: "Create Docker and docker-compose configuration"
   
   Bob Actions:
   - Write Dockerfile for backend
   - Write Dockerfile for frontend
   - Create docker-compose.yml
   - Add nginx configuration
   
   Files Created:
   - backend/Dockerfile
   - frontend/Dockerfile
   - deploy/docker-compose.yml
   - deploy/nginx/nginx.conf
   ```

3. **Demo Data (Hours 46-47)**
   ```
   Code Mode Task: "Create seed data for demo"
   
   Bob Actions:
   - Write management command
   - Create sample artisans
   - Add sample products
   - Generate test commissions
   
   Files Created:
   - backend/apps/common/management/commands/seed_data.py
   ```

4. **Bob Session Export (Hour 47-48)**
   ```
   Plan Mode Task: "Compile comprehensive SDLC report"
   
   Bob Actions:
   - Export all session logs
   - Organize by phase
   - Create summary document
   - Highlight key decisions
   
   Files Created:
   - bob-report/SDLC_REPORT.md
   - bob-report/SESSION_SUMMARY.md
   ```

---

## Bob Session Organization

### Directory Structure

```
bob-report/
├── 01-plan-mode/
│   ├── architecture-design.md
│   ├── data-modeling.md
│   ├── api-planning.md
│   └── technical-decisions.md
│
├── 02-code-mode/
│   ├── backend/
│   │   ├── project-setup.md
│   │   ├── authentication.md
│   │   ├── models-implementation.md
│   │   └── api-endpoints.md
│   └── frontend/
│       ├── react-setup.md
│       ├── components.md
│       ├── api-integration.md
│       └── routing.md
│
├── 03-ask-mode/
│   ├── backend-review/
│   │   ├── performance-optimization.md
│   │   ├── security-review.md
│   │   └── debugging-sessions.md
│   └── frontend-review/
│       ├── code-review.md
│       └── ux-improvements.md
│
├── 04-advanced-mode/
│   ├── pdf-generation.md
│   ├── email-integration.md
│   └── ibm-cos-setup.md
│
├── 05-testing-polish/
│   ├── test-implementation.md
│   ├── bug-fixes.md
│   └── optimization.md
│
├── 06-documentation/
│   ├── deployment-guide.md
│   └── api-docs.md
│
├── SDLC_REPORT.md           # Comprehensive summary
└── SESSION_SUMMARY.md       # Quick reference
```

---

## Mode Switching Strategy

### When to Switch Modes

**Plan → Code:**
```
Trigger: Architecture and design complete
Reason: Ready to implement planned features
Example: "Switch to Code mode to implement the User model"
```

**Code → Ask:**
```
Trigger: Need code review or debugging help
Reason: Stuck on implementation or need optimization
Example: "Switch to Ask mode to review query performance"
```

**Code → Advanced:**
```
Trigger: Need complex integrations (MCP, Browser tools)
Reason: Standard code mode lacks required tools
Example: "Switch to Advanced mode for PDF generation"
```

**Ask → Code:**
```
Trigger: Solution identified, ready to implement
Reason: Need to apply suggested fixes
Example: "Switch to Code mode to implement optimization"
```

**Any → Plan:**
```
Trigger: Need to redesign or plan new feature
Reason: Architecture changes required
Example: "Switch to Plan mode to redesign invoice workflow"
```

---

## Key Metrics to Track

### Development Velocity
- Features completed per hour
- Lines of code written
- API endpoints implemented
- Components created

### Bob Effectiveness
- Time saved vs manual coding
- Issues caught in review
- Optimizations suggested
- Documentation quality

### Quality Metrics
- Test coverage
- Code review findings
- Performance improvements
- Security issues identified

---

## Best Practices for Bob Usage

### 1. Clear Task Definition
```
❌ Bad: "Build the backend"
✅ Good: "Create Django User model with ARTISAN/DESIGNER roles and JWT authentication"
```

### 2. Incremental Development
```
✅ Break large tasks into smaller steps
✅ Confirm each step before proceeding
✅ Export sessions after each phase
```

### 3. Mode Selection
```
✅ Use Plan mode for design decisions
✅ Use Code mode for implementation
✅ Use Ask mode for review and debugging
✅ Use Advanced mode for complex integrations
```

### 4. Documentation
```
✅ Export sessions regularly
✅ Document key decisions
✅ Save code snippets
✅ Track issues and solutions
```

### 5. Review Process
```
✅ Use Ask mode to review critical code
✅ Request security analysis
✅ Ask for performance optimization
✅ Validate architecture decisions
```

---

## Expected Outcomes

### By End of 48 Hours

**Deliverables:**
1. ✅ Fully functional backend API
2. ✅ Complete frontend application
3. ✅ IBM COS integration
4. ✅ PDF invoice generation
5. ✅ Email notifications
6. ✅ Comprehensive documentation
7. ✅ Docker deployment setup
8. ✅ Demo data and scenarios
9. ✅ Complete Bob session exports
10. ✅ SDLC report

**Bob Session Exports:**
- 50+ documented interactions
- 10+ code review sessions
- 5+ debugging sessions
- Complete architecture documentation
- Implementation decision log

**Demonstration of Bob Across SDLC:**
- Planning & Architecture ✅
- Implementation ✅
- Code Review ✅
- Debugging ✅
- Optimization ✅
- Testing ✅
- Documentation ✅
- Deployment ✅

---

This SDLC workflow demonstrates comprehensive usage of IBM Bob across all phases of software development, showcasing its versatility and effectiveness in accelerating the development process while maintaining code quality and documentation standards.