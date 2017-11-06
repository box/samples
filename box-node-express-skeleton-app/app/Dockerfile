FROM node:latest

RUN useradd --user-group --create-home --shell /bin/false app
RUN npm install -g pm2

ENV HOME=/home/app
USER root
COPY . $HOME/app
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/app
RUN npm install

USER app

CMD ["pm2", "start", "./processes.json", "--no-daemon"]