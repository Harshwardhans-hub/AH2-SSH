# GitHub Setup Guide

Follow these steps to push your project to GitHub.

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `ssh-alumni-connect` (or your preferred name)
   - **Description**: "College Placement Management System with Real-time Synchronization"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 2: Initialize Git in Your Project

Open your terminal/command prompt in the project directory and run:

```bash
cd SSH-FINAL-PROTOTYPE
git init
```

## Step 3: Add All Files

```bash
git add .
```

## Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: SSH Alumni Connect - Placement Management System"
```

## Step 5: Add Remote Repository

Replace `YOUR_USERNAME` with your GitHub username and `REPO_NAME` with your repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

Example:
```bash
git remote add origin https://github.com/johndoe/ssh-alumni-connect.git
```

## Step 6: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

If prompted, enter your GitHub credentials or use a Personal Access Token.

## Step 7: Verify

Go to your GitHub repository URL:
```
https://github.com/YOUR_USERNAME/REPO_NAME
```

You should see all your files uploaded!

## Alternative: Using GitHub Desktop

1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Open GitHub Desktop
3. Click "File" → "Add Local Repository"
4. Browse to your `SSH-FINAL-PROTOTYPE` folder
5. Click "Publish repository"
6. Choose repository name and visibility
7. Click "Publish Repository"

## Creating a Personal Access Token (if needed)

If you're using HTTPS and need a token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "SSH Alumni Connect")
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token (you won't see it again!)
7. Use this token as your password when pushing

## Quick Commands Reference

```bash
# Check status
git status

# Add specific files
git add filename.js

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push changes
git push

# Pull latest changes
git pull

# Check remote URL
git remote -v

# Change remote URL
git remote set-url origin https://github.com/USERNAME/REPO.git
```

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### Error: "failed to push some refs"
```bash
git pull origin main --rebase
git push -u origin main
```

### Large files error
If you get errors about large files (like node_modules):
```bash
# Make sure .gitignore is set up correctly
git rm -r --cached node_modules
git commit -m "Remove node_modules"
git push
```

## After Pushing

1. Add a nice repository description on GitHub
2. Add topics/tags: `react`, `nodejs`, `placement-management`, `alumni-connect`
3. Update the README with your actual repository URL
4. Consider adding:
   - GitHub Actions for CI/CD
   - Issue templates
   - Contributing guidelines
   - Code of conduct

## Sharing Your Repository

Once pushed, share your repository link:
```
https://github.com/YOUR_USERNAME/REPO_NAME
```

Example:
```
https://github.com/johndoe/ssh-alumni-connect
```

## Next Steps

- Add screenshots to README
- Create a demo video
- Deploy to Heroku/Vercel/Netlify
- Add badges to README (build status, license, etc.)
- Set up GitHub Pages for documentation

---

Need help? Check [GitHub Docs](https://docs.github.com/en/get-started/quickstart/create-a-repo)
