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

The simulation follows a route through **Nashik–Deolali** (sample). The app loads dummy route data from `public/dummy-route.json` at runtime when present, and gracefully falls back to `src/data/dummy-route.json` (bundled) if the public file is missing.

Quick start: to replace the route without rebuilding, add a file at `public/dummy-route.json` with your coordinates (see Assignment Checklist below).

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
│   └── dummy-route.json     # Bundled fallback GPS route coordinates
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
5. **Monitor Stats**: Watch real-time updates in the info panel

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

## ✅ Assignment Checklist (What Reviewers Look For)

- Map Integration
  - Leaflet map centered on a predefined route
  - Vehicle marker rendered and updated in real time
  - Full route drawn with a polyline; traveled path thick and prominent
- Dummy Location Data
  - Route data available as JSON
  - At runtime, app fetches `public/dummy-route.json`; otherwise uses bundled fallback in `src/data/dummy-route.json`
- Simulated Real-Time Movement
  - Vehicle position updates smoothly using interpolation
  - Traveled polyline extends as the vehicle moves
- Interface & Features
  - Play/Pause, Restart, Speed controls (1x/2x/4x)
  - Metadata: coordinates, elapsed time, speed, battery, progress
  - Responsive UI, non-blocking overlays over the map

## ✍️ Provide Your Own Route (public/dummy-route.json)

Create `public/dummy-route.json` to override the bundled route without rebuilding:

```json
[
  { "latitude": 17.385044, "longitude": 78.486671, "timestamp": "2024-07-20T10:00:00Z" },
  { "latitude": 17.385200, "longitude": 78.486800, "timestamp": "2024-07-20T10:00:10Z" },
  { "latitude": 17.385450, "longitude": 78.487100, "timestamp": "2024-07-20T10:00:20Z" }
]
```

Notes:
- Timestamp is optional; when present, the app uses it for speed calculation between points.
- Keep points reasonably spaced (≈10–50 meters) for smooth animation.

## 🧪 How It Maps to the Assignment

- Frontend-only SPA with React (Vite + TS)
- Leaflet for mapping; no backend required
- JSON data-driven simulation with smooth animation and UI controls
- Clean, modular code (`MapView`, `Controls`, `InfoPanel`, utilities)

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
