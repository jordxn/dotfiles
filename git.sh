if [ "$#" -eq 2 ]
    then
    git config --global user.name "$1"
    git config --global user.email "$2"
    git config --global push.default simple
    git config --list
    git config --global credential.helper osxkeychain
else 
    echo "Pass your name in quotes and your email"
fi
