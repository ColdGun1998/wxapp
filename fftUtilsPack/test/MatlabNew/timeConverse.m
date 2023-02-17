function arriveTime = timeConverse(signal,signalLength)
timeStamp = signal(2,:);
count = 1;
arriveTime1719 = ones(1,5);
for i = 2:length(timeStamp)
    if(timeStamp(i)~=0)
        if(timeStamp(i)~=timeStamp(i-1))&&(timeStamp(i)==timeStamp(i+1))
            arriveTime1719(count) = timeStamp(i)*signalLength*2+signal(1,i);
            count = count + 1;
        end
    end
end
arriveTime1719 = [timeStamp(1)*2*signalLength+signal(1,1) arriveTime1719];
arriveTime1719 = arriveTime1719/48000;

for countE = 1:length(arriveTime1719)-1
    if arriveTime1719(countE+1)-arriveTime1719(countE)<0.1
        arriveTime1719(countE+1) = 0;
    end
end
arriveTime1719(arriveTime1719==0) = [];
arriveTime = arriveTime1719;
end
