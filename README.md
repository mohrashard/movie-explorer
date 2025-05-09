# OceansFlixx - Movie Explorer Application

![OceansFlixx Logo](public/oceanflixlogo.png)

## 🎬 Project Overview

OceansFlixx is a responsive web application that allows users to search for movies, view details, and discover trending films. The application fetches real-time data from The Movie Database (TMDb) API to provide users with an interactive and engaging movie browsing experience.

### 🔗 Live Demo
[OceansFlixx Live Demo](https://oceansflixx.vercel.app/)

### 📁 Repository Links
- [GitHub Repository](https://github.com/mohrashard/movie-explorer.git)
- [GitLab Repository](https://gitlab.com/mohrashard/movie-explorer.git)

## ✨ Features

- **User Authentication**
  - Login and registration system with local storage persistence
  - Protected routes for authenticated users

- **Movie Discovery**
  - Trending movies section displaying popular films
  - Search functionality to find specific movies
  - Infinite scrolling for search results

- **Movie Details**
  - Comprehensive information about each movie (overview, genre, rating)
  - Cast information
  - Embedded trailer viewing
  - Add/remove from favorites

- **User Preferences**
  - Light/Dark mode toggle
  - Save favorite movies (persistent in local storage)
  - Last search query persistence

- **Advanced Features**
  - Filter movies by genre, year, and rating
  - Responsive design for all devices
  - Graceful error handling

## 🛠️ Technologies Used

- **Frontend Framework**
  - React.js (Create React App)
  - Version: 18.2.0
  
- **State Management**
  - React Context API
  - Local Storage for persistence
  
- **UI/UX**
  - Material-UI (MUI) components v5.11.0
  - Custom CSS for enhanced styling
  - Emotion for styled components
  - Mobile-first responsive design
  
- **Routing**
  - React Router v6.6.1 for navigation
  
- **API Integration**
  - Axios v1.2.1 for HTTP requests
  - TMDb API for movie data
  
- **Testing**
  - Jest for unit and integration tests
  - React Testing Library for component tests
  
- **Development Tools**
  - ESLint for code quality
  - Prettier for code formatting
  
- **Deployment**
  - Vercel for hosting

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- TMDb API key (get one at [https://developers.themoviedb.org/3](https://developers.themoviedb.org/3))

### Installation

1. Clone the repository (choose one):
   
   **From GitHub:**
   ```bash
   git clone https://github.com/mohrashard/movie-explorer.git
   cd movie-explorer
   ```
   
   **From GitLab:**
   ```bash
   git clone https://gitlab.com/mohrashard/movie-explorer.git
   cd movie-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   # OR if using yarn
   yarn install
   ```

3. Create a `.env` file in the root directory and add your TMDb API key:
   ```
   REACT_APP_TMDB_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm start
   # OR if using yarn
   yarn start
   ```

5. The application will be available at `http://localhost:3000`

### Build for Production

To create a production build:
```bash
npm run build
# OR if using yarn
yarn build
```

The optimized build will be available in the `build` directory.

## 📂 Project Structure

```
movie-explorer/
├── public/
│   ├── oceanflixlogo.png
│   └── index.html
├── src/
│   ├── components/
│   │   ├── FilterPanel.js
│   │   ├── MovieCard.js
│   │   ├── Navbar.js
│   │   ├── ProtectedRoute.js
│   │   └── SearchBar.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   ├── MovieContext.js
│   │   └── ThemeContext.js
│   ├── pages/
│   │   ├── Favorites.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── MovieDetails.js
│   │   ├── NotFound.js
│   │   └── Register.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── localStorage.js
│   ├── styles/
│   │   └── home.css
│   ├── App.js
│   └── index.js
└── package.json
```

## 🔌 API Integration

The application uses the TMDb API to fetch movie data. All API calls are handled through the `api.js` service which includes:

- `searchMovies(query, page)`: Search for movies based on query
- `getTrending(page)`: Get trending movies for the week
- `getMovieDetails(movieId)`: Get detailed information about a specific movie
- `getMovieCredits(movieId)`: Get cast and crew information
- `getMovieVideos(movieId)`: Get trailers and other video content
- `getMoviesByGenre(genreId, page)`: Get movies filtered by genre
- `getGenres()`: Get list of all genres
- `discoverMovies(params)`: Get movies based on various filters

The API service includes interceptors for request and response handling, with error management and retry capability for network issues.

## 🔒 Authentication

The application uses a simulated authentication system with local storage:

- User registration stores credentials in local storage
- Login validates against stored credentials
- Protected routes ensure only authenticated users access certain pages
- Authentication state is managed through React Context API

## 💾 Local Storage Usage

The application utilizes local storage for persistent data management:

### Local Storage Keys
- `oceansflixx_user`: User authentication data (email, username, password hash)
- `oceansflixx_favorites`: Array of user's favorite movie IDs and basic info
- `oceansflixx_lastSearch`: Last search query for quick resume
- `oceansflixx_theme`: User's theme preference (light/dark mode)
- `oceansflixx_apiKey`: TMDb API key fallback (if not in environment variables)

### Data Management
The application includes utility functions in `src/utils/localStorage.js` for:
- Safe storage with error handling
- Data retrieval with fallbacks
- Data expiration management
- Storage quota management

## 📱 Responsive Design

The application follows mobile-first design principles:

- Adaptive layout for different screen sizes
- Touchscreen-friendly UI elements
- Optimized performance for mobile devices

## 🚢 Deployment

### Vercel Deployment (Recommended)
The application is currently deployed on Vercel:

1. Connect your GitHub or GitLab repository to Vercel
2. Set up environment variables for the API key:
   - Name: `REACT_APP_TMDB_API_KEY`
   - Value: Your TMDb API key
3. Deploy with default settings
4. Access your deployed application at the provided Vercel URL

### Alternative Deployment Options

#### Netlify
1. Connect your GitHub or GitLab repository to Netlify
2. Set build command: `npm run build` or `yarn build`
3. Set publish directory: `build`
4. Add environment variable for the API key
5. Deploy with default settings

#### GitHub Pages
1. Install gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   # OR
   yarn add --dev gh-pages
   ```
2. Add homepage field to package.json:
   ```json
   "homepage": "https://yourusername.github.io/movie-explorer"
   ```
3. Add deploy scripts to package.json:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build",
     ...
   }
   ```
4. Deploy the application:
   ```bash
   npm run deploy
   # OR
   yarn deploy
   ```

## 🧪 Testing

### Running Tests
To run the test suite:

```bash
npm test
# OR if using yarn
yarn test
```

### Running Tests in Watch Mode
For development with continuous test feedback:

```bash
npm test -- --watch
# OR if using yarn
yarn test --watch
```

### Test Coverage Report
To generate a coverage report:

```bash
npm test -- --coverage
# OR if using yarn
yarn test --coverage
```

The coverage report will be available in the `coverage` directory.

## 📋 Future Enhancements

- User profile customization
- Social sharing functionality
- Advanced filtering and sorting options
- Movie recommendations based on user preferences
- Watchlist feature
- User ratings and reviews

## 📄 License

[MIT License](LICENSE)

## 👨‍💻 Author

Mohamed Rashard