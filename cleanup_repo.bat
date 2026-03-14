@echo off
echo Cleaning repository...

:: Remove node_modules from tracking if present
git rm -r --cached node_modules 2>nul
git rm -r --cached frontend/node_modules 2>nul
git rm -r --cached backend/node_modules 2>nul

:: Add all files (respecting .gitignore)
echo Staging files...
git add .

:: Commit
echo Committing...
git commit -m "Clean repo: remove node_modules and large files"

:: Push
echo Pushing to main...
git push -u origin main

echo Done.
pause
