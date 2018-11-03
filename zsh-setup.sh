
# install xcode developer tools (required for homebrew)
xcode-select --install

# install homebrew
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# install latest git and zsh
brew install git zsh

# change default shell to zsh
sudo sh -c "echo $(which zsh) >> /etc/shells"
chsh -s $(which zsh)

# install oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

# install terminal fonts (powerline)
git clone https://github.com/powerline/fonts.git --depth=1 ~/.powerlinefonts
~/.powerlinefonts/install.sh && rm -rf ~/.powerlinefonts

# install scm_breeze (I like this better than the "git" zsh plugin)
git clone git://github.com/scmbreeze/scm_breeze.git ~/.scm_breeze
~/.scm_breeze/install.sh
source ~/.zshrc

# install bash-git-prompt (I like this better than the zsh terminal)
brew install bash-git-prompt

# install wget
brew install wget

# show hidden files
defaults write com.apple.finder AppleShowAllFiles YES

# install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | zsh

# install automatic version switching
npm install -g avn avn-nvm avn-n
avn setup

# move custom zsh file over
mv ~/.zshrc ~/.zshrc.bak
cp ./zshrc ~/.zshrc

# install slate
mv .slate.js ~/.slate.js