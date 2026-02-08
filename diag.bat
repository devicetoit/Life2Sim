@echo off
echo Diagnostic Start > diag.txt
echo Node version: >> diag.txt
node --version >> diag.txt 2>&1
echo Python version: >> diag.txt
python --version >> diag.txt 2>&1
echo Pip version: >> diag.txt
pip --version >> diag.txt 2>&1
echo Directory: >> diag.txt
dir >> diag.txt
echo Diagnostic End >> diag.txt
