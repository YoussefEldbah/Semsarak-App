# Semsarak - Real Estate Platform

A modern real estate platform built with Angular 18, featuring a beautiful UI and comprehensive functionality for property search and management.

## 🏠 Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Property Search**: Advanced search functionality with filters
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works perfectly on all devices
- **Component-Based Architecture**: Modular and maintainable code structure

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd semsarak-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── navbar/          # Navigation component
│   │   └── footer/          # Footer component
│   ├── pages/
│   │   ├── home/           # Home page component
│   │   ├── login/          # Login page component
│   │   └── register/       # Register page component
│   ├── app.component.ts    # Main app component
│   ├── app.routes.ts       # Application routes
│   └── app.config.ts       # App configuration
├── styles.css              # Global styles
└── index.html              # Main HTML file
```

## 🎨 Design System

The project uses a consistent design system with:

- **Color Palette**: Blue and gold theme with CSS variables
- **Typography**: Inter font family
- **Components**: Bootstrap 5 for responsive grid and components
- **Icons**: Font Awesome for consistent iconography

### CSS Variables

```css
:root {
  --primary-blue: #1e3a8a;
  --secondary-blue: #3b82f6;
  --accent-gold: #f59e0b;
  --warm-gray: #6b7280;
  --light-gray: #f3f4f6;
  --white: #ffffff;
  --dark: #111827;
  --success-green: #10b981;
}
```

## 🔧 Development

### Available Scripts

- `ng serve` - Start development server
- `ng build` - Build the project for production
- `ng test` - Run unit tests
- `ng lint` - Run linting

### Adding New Pages

1. Generate a new component:
```bash
ng generate component pages/new-page
```

2. Add the route in `app.routes.ts`:
```typescript
{ path: 'new-page', component: NewPageComponent }
```

3. Update navigation in `navbar.component.html`

### Adding New Components

1. Generate a new component:
```bash
ng generate component components/new-component
```

2. Import and use in other components as needed

## 📱 Responsive Design

The application is fully responsive and includes:

- Mobile-first approach
- Breakpoints for tablets and desktops
- Flexible grid system
- Touch-friendly interactions

## 🔐 Authentication

The login system includes:

- Form validation
- Password visibility toggle
- Remember me functionality
- Google OAuth integration (ready for implementation)

### Demo Credentials

For testing purposes:
- Email: `admin@example.com`
- Password: `password123`

## 🎯 Future Enhancements

- [ ] Property details page
- [ ] User dashboard
- [ ] Property listing management
- [ ] Advanced search filters
- [ ] Map integration
- [ ] Real-time notifications
- [ ] Admin panel
- [ ] Payment integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact:
- Email: info@semsarak.com
- Phone: +20 123 456 7890

---

Built with ❤️ using Angular 18
