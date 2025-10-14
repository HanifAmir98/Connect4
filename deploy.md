# Deployment Guide

## GitHub Pages Deployment (Recommended for Static Version)

1. **Fork this repository** to your GitHub account

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Access your game**:
   - Your game will be available at: `https://yourusername.github.io/connect4`
   - Replace `yourusername` with your actual GitHub username

4. **Custom domain (optional)**:
   - In the Pages settings, you can set a custom domain
   - Update the `_config.yml` file with your domain

## Heroku Deployment (For WebSocket Version)

1. **Install Heroku CLI**:
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku app**:
   ```bash
   cd connect4
   heroku create your-app-name
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

5. **Open your app**:
   ```bash
   heroku open
   ```

## Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd connect4
   vercel
   ```

3. **Follow the prompts** and your app will be deployed

## Netlify Deployment

1. **Connect your GitHub repository** to Netlify
2. **Set build settings**:
   - Build command: (leave empty for static site)
   - Publish directory: `/` (root)
3. **Deploy** automatically on every push

## Environment Variables

For the WebSocket server version, you can set these environment variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Domain Configuration

### Custom Domain for GitHub Pages

1. Add a `CNAME` file to your repository root:
   ```
   yourdomain.com
   ```

2. Configure DNS records with your domain provider:
   ```
   Type: CNAME
   Name: www
   Value: yourusername.github.io
   ```

3. Update `_config.yml`:
   ```yaml
   url: "https://yourdomain.com"
   ```

## Troubleshooting

### GitHub Pages Issues

- **404 Error**: Make sure `index.html` is in the root directory
- **CSS not loading**: Check file paths are relative
- **JavaScript errors**: Open browser console to debug

### WebSocket Server Issues

- **Connection refused**: Check if server is running
- **CORS errors**: Ensure CORS is properly configured
- **Port conflicts**: Change PORT environment variable

### Performance Tips

- **Compress images**: Use WebP format for better compression
- **Minify CSS/JS**: Use build tools to minify files
- **Enable caching**: Set appropriate cache headers
- **Use CDN**: Consider using a CDN for static assets

## Monitoring

### GitHub Pages
- Monitor in repository Insights > Traffic
- Check Pages settings for deployment status

### Heroku
- Use Heroku dashboard for logs and metrics
- Set up monitoring with New Relic or similar

### General
- Use Google Analytics for user tracking
- Monitor with UptimeRobot for availability
- Set up error tracking with Sentry
