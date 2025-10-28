# Vehicle Movement Tracker

A real-time vehicle tracking simulation application built with React, TypeScript, Vite, Tailwind CSS, and Leaflet.js. This app visualizes a vehicle moving along a predefined route with smooth animations and live tracking data.

## 🚀 Features

- **Interactive Map**: Powered by Leaflet.js with OpenStreetMap tiles
- **Real-time Simulation**: Watch a vehicle move smoothly along a route with 50+ GPS coordinates
- **Dynamic Route Visualization**: Polyline extends as the vehicle progresses
- **Playback Controls**: Play, Pause, Restart functionality
- **Speed Control**: Adjust simulation speed (1x, 2x, 4x)
- **Live Statistics**:
  - Current GPS coordinates
  - Real-time speed calculation (km/h)
  - Elapsed time tracker
  - Battery level indicator
  - Route progress percentage
- **Smooth Animations**: Framer Motion powered UI transitions
- **Glass-morphic Design**: Modern dark theme with backdrop blur effects
- **Responsive Layout**: Optimized for all screen sizes

## 📍 Route Information

The simulation follows a route through **Nashik-Deolali region** in Maharashtra, India. The dummy route data (`src/data/dummy-route.json`) contains 56 GPS coordinates with timestamps, creating a realistic driving path.

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Leaflet.js** - Interactive maps
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library
- **React Router** - Routing

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm installed

### Steps

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd vehicle-movement-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:8080`

4. **Build for production**
```bash
npm run build
```

5. **Preview production build**
```bash
npm run preview
```

## 🚢 Deployment

### Deploy to Vercel

1. Install Vercel CLI (optional)
```bash
npm i -g vercel
```

2. Deploy
```bash
vercel
```

Or connect your GitHub repo to Vercel dashboard for automatic deployments.

### Deploy to Netlify

1. Build the project
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify via:
   - Netlify CLI: `netlify deploy --prod`
   - Drag & drop on Netlify dashboard
   - Connect GitHub repo for auto-deploy

## 📂 Project Structure

```
src/
├── components/
│   ├── MapView.tsx          # Leaflet map component
│   ├── Controls.tsx         # Play/Pause/Speed controls
│   ├── InfoPanel.tsx        # Live stats display
│   └── ui/                  # shadcn/ui components
├── data/
│   └── dummy-route.json     # GPS route coordinates
├── utils/
│   └── haversine.ts         # Distance & speed calculations
├── pages/
│   ├── Index.tsx            # Main app page
│   └── NotFound.tsx         # 404 page
├── App.tsx                  # App router
├── main.tsx                 # Entry point
└── index.css                # Design system & styles
```

## 🎮 How to Use

1. **Start Simulation**: Click the Play button to begin vehicle movement
2. **Pause**: Click Pause to freeze the simulation
3. **Restart**: Reset to the beginning of the route
4. **Adjust Speed**: Use 1x, 2x, or 4x buttons to change playback speed
5. **View Full Route**: Click the zoom icon to see the entire path (faint dashed line)
6. **Monitor Stats**: Watch real-time updates in the info panel

## 🧮 Technical Details

### Movement Logic
- Vehicle moves between GPS points with **smooth interpolation**
- Updates every **50ms** for fluid animation
- Base movement speed: **2 seconds per point** (adjustable with speed multiplier)

### Speed Calculation
Uses the **Haversine formula** to calculate:
- Distance between consecutive GPS coordinates
- Speed in km/h based on distance and timestamp difference

### Battery Simulation
- Starts at 100%
- Decreases by 0.3% per GPS point
- Color-coded indicator (green > yellow > red)

## 🎨 Design System

- **Primary Color**: Blue (`#2563eb`) - Tech/tracking theme
- **Accent Color**: Cyan (`#06b6d4`) - Highlights
- **Background**: Dark navy (`#1e293b`)
- **Effects**: Glass-morphism, gradient overlays, glow shadows

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ using React + Vite + Leaflet.js
