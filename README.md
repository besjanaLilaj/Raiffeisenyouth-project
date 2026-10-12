# Raiffeisen Youth spending demo

A small **React Native app written in JavaScript**. Open it on your iPhone with Expo Go. The spending, transactions, and budgets are fictional demo data; the app is not connected to Raiffeisen or a real bank account.

The repository also includes a browser version (`index.html`, `styles.css`, and `script.js`). Docker and the GitHub Actions workflow in this guide package and publish that browser version; they do not build a native iOS or Android app.

## What you need

- Node.js LTS on your computer. npm is included with Node.js.
- Expo Go on your iPhone.
- Your iPhone and computer connected to the same Wi-Fi.

You do not need to install Xcode, Android Studio, TypeScript, or any additional packages by hand. IntelliJ is just where you open the project and its terminal.

## Start the app from IntelliJ

1. Open this project folder in IntelliJ.
2. Open **View → Tool Windows → Terminal**. The terminal should start in the project folder (the folder containing `package.json`).
3. Check Node.js and npm are available:

   ```powershell
   node -v
   npm -v
   ```

   Each command should print a version number. If IntelliJ was open during Node.js installation, close and reopen IntelliJ before trying again.

4. Install the project dependencies:

   ```powershell
   npm install
   ```

5. Start Expo:

   ```powershell
   npx expo start
   ```

6. When Expo displays a QR code, scan it with your iPhone camera and tap the link to open the project in Expo Go.

If the QR code does not connect, stop Expo with **Ctrl+C** and try:

```powershell
npx expo start --tunnel
```

## Try the demo

- Switch between **Home**, **Activity**, and **Budgets** with the bottom tabs.
- Tap a budget to edit its monthly limit.
- Choose **This week** or **This month** to change the displayed period.
- Tap the top-right eye-shaped button to hide or reveal the sample totals.

Budget edits last only until the app reloads. To run the app again later, open the IntelliJ terminal in this project folder and run `npx expo start`.

## Run the browser version with Docker

Install and start Docker Desktop, then run these commands from the project folder:

```powershell
docker build -t raiffeisen-youth-web .
docker run --rm -p 8080:80 raiffeisen-youth-web
```

Open <http://localhost:8080>. Stop the container with **Ctrl+C**.

The `Dockerfile` packages the static browser app into a small Nginx web server image. Docker makes the app run consistently without installing a web server on each machine. It is for the browser version, not for running the Expo app in a phone simulator.

## GitHub, CI, and CD

To push this project to a new GitHub repository, create an empty repository on GitHub, then use the IntelliJ terminal here. Replace the URL with your repository's URL:

```powershell
git branch -M main
git add .
git commit -m "Add Raiffeisen Youth demo"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

If `git remote -v` already shows an `origin`, do not add it again; push with `git push -u origin main`. GitHub will run `.github/workflows/web-ci-cd.yml` automatically:

- **CI (Continuous Integration)** checks the browser JavaScript syntax and builds the Docker image on pushes and pull requests. This catches common errors before changes are merged.
- **CD (Continuous Delivery)** publishes the image to GitHub Container Registry (GHCR) after a push to the repository's default branch or a version tag such as `v1.0.0`. The published image can be pulled and run with Docker; this workflow does not deploy a public website by itself.
