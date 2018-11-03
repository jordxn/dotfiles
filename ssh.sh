if [ -z "$1" ]
  then
    echo "Please provide ssh password as first argument"
fi

# setup ssh
mkdir -p ~/.ssh
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -P "$1"

# Add the key to the ssh-agent
ssh-add -K ~/.ssh/id_rsa

# Mac OS, remember password on restart
cp ssh/config ~/.ssh

# Copy current to clipboard
pbcopy < ~/.ssh/id_rsa.pub

echo "SSH Setup Complete. Public key is in your clipboard."