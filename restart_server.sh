#!/bin/bash

if [[ $(/usr/sbin/lsof -ti :4000) ]]; then
    echo "Server already running... Cool!"
else
    echo "Starting reg Server"
    # cd /var/app/album-timeline && . ~/.nvm/nvm.sh && nohup node backend.js 0<&- &>/home/ec2-user/boot-log.log &
    cd /var/app/three-js && . ~/.nvm/nvm.sh && node server.js 0<&- &>/home/ec2-user/boot-log.log &

    echo "I rly deed it"
fi