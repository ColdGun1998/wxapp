%% to conduct positioning in 1-d condition
% refresh rate: 2Hz = 150ms + 200ms
clc;clear;close all;
% totalLength: length of BS;
% timeInterval: real interval of BS;
% c :sound speed
totalLength = 10.468;
timeInterval = 0.139833;
c = 340;

signal = audioread("data.wav");signal = signal(:,1);
% TOA estimation
originArriveTime = toaEstimationNew(signal,2048,17e3,19e3,0,14);
timeStamp = originArriveTime(2,:);
count = 1;
arriveTime = ones(1,5);
for i = 2:length(timeStamp)
    if(timeStamp(i)~=0)
        if(timeStamp(i)~=timeStamp(i-1))&&(timeStamp(i)==timeStamp(i+1))
            arriveTime(count) = timeStamp(i)*4096+originArriveTime(1,i);
            count = count + 1;
        end
    end
end
% interval judgement,calculate the tdoa
timeDelta = ones(1,5);
for i = 1:length(arriveTime)-1
timeDelta(i) = arriveTime(i+1) - arriveTime(i);
end
tdoa = timeDelta(timeDelta<24000)/48000;
% position caculation
%distance to a = (d+c(delta + tdoa))/2
distance1D = ones(1,5);
for j = 1:length(tdoa)-1
distance1D(j) = (totalLength+c*(timeInterval - tdoa(j)))/2;
end
distanceFinal = distance1D(distance1D>0);
distanceFinal = distanceFinal(distanceFinal<totalLength);
plot(distanceFinal);
