clear, clc,close all;
%% implementing multiple bandpass filters
% frequency set
freqStart1 = 17e3; freqEnd1 = 19e3;
freqStart2 = 21e3; freqEnd2 = 23e3;
frequencySet = [freqStart1 freqEnd1 freqStart2 freqEnd2];
f1 = freqStart1;
f2 = freqEnd1;
f3 = freqStart2;
fCom = [f1 f2 f3];
fs = 48e3; %
signal = audioread("Recording #78.wav");
signal = signal(:,1);
secondNum = length(signal)/48000;

second = 1;

signal = signal(second*48000+1:(second+1)*48000);

%% single detection
% bandpass filter
signalf1 = filterChirp(signal,f1-300,f1+300,0);
signalf2 = filterChirp(signal,f2-300,f2+300,0);
signalf3 = filterChirp(signal,f3-300,f3+300,0);
% range the single frequency SPL
[Bsingle,Isingle] = sort([mean(abs(signalf1)),mean(abs(signalf2)),mean(abs(signalf3))]);

%% chirp detection
% bandpass filter
chirpf1 = filterChirp(signal,freqStart1+400,freqEnd1-400,0);
chirpf2 = filterChirp(signal,freqEnd1+400,freqStart2-400,0);
chirpf3 = filterChirp(signal,freqStart2+400,freqEnd2-400,0);
chirpSet = [chirpf1 chirpf2 chirpf3];
% range the chirp frequency SPL
[Bchirp,Ichirp] = sort([mean(abs(chirpf1)),mean(abs(chirpf2)),mean(abs(chirpf3))]);
%% estimation
if Isingle(end)==Ichirp(end)
    chirpNum = Isingle(end);
elseif Ichirp(end)==3&&Isingle(end)==1
    chirpNum = 3;
else
    [Bmix,Imix] = sort([mean(abs(signalf1))+mean(abs(chirpf1)),mean(abs(signalf2))+mean(abs(chirpf2)),mean(abs(signalf3))+mean(abs(chirpf3))]);
    % assist judge
    chirpNum = Imix(end);
end
chirpNum
originArriveTime = toaEstimationNew(chirpSet(:,chirpNum),48000*0.03,frequencySet(chirpNum),frequencySet(chirpNum+1),1.3,2);
timeStamp = originArriveTime(2,:);
count = 1;
arriveTime = ones(1,5);
for i = 2:length(timeStamp)
    if(timeStamp(i)~=0)
        if(timeStamp(i)~=timeStamp(i-1))&&(timeStamp(i)==timeStamp(i+1))
            arriveTime(count) = timeStamp(i)*2*48000*0.03+originArriveTime(1,i);
            count = count + 1;
        end
    end
end
arriveTime = [timeStamp(1)*2*48000*0.03+originArriveTime(1,1) arriveTime];
arriveTime = arriveTime/48000+second*ones(1,length(arriveTime));
if count==5
    arriveTime = arriveTime(1:5);
end
if count<5
    lengthArriveTime = count
end
%% surplus judgement

if count>5
    list = [];
    for delta = 1:count-1
        if arriveTime(delta+1)-arriveTime(delta)<0.1
            list = [list delta+1];
        end
    end
    arriveTime(list) = [];
    
end


%% supplement judgement
if count<5
    % judge the loss
    list1 = [];
    for delta = 1:count-1
        if arriveTime(delta+1)-arriveTime(delta)>0.25
            list1 = [list1 delta+1];
        end
    end
    if sqrt(Ichirp-Isingle)==0
        chirpNum2 = Isingle(end-1);
    else
        
        chirpNum2 = Imix(end-1);
    end
    originArriveTime1 = toaEstimationNew(chirpSet(:,chirpNum2),48000*0.03,frequencySet(chirpNum2),frequencySet(chirpNum2+1),1.3,2);
    timeStamp1 = originArriveTime1(2,:);
    count1 = 1;
    arriveTime1 = ones(1,5);
    for i1 = 2:length(timeStamp1)
        if(timeStamp1(i1)~=0)
            if(timeStamp1(i1)~=timeStamp1(i1-1))&&(timeStamp1(i1)==timeStamp1(i1+1))
                arriveTime1(count1) = timeStamp1(i1)*2*48000*0.03+originArriveTime1(1,i1);
                count1 = count1 + 1;
            end
        end
    end
    arriveTime1 = [timeStamp1(1)*2*48000*0.03+originArriveTime1(1,1) arriveTime1];arriveTime1 = arriveTime1(1:5);
    arriveTime1 = arriveTime1/48000+second*ones(1,length(arriveTime1));
    if count1==5
        chirpNum2
        arriveTime1
    end
    if count1<5
        list2 = [];
        for delta = 1:length(count-1)
            if arriveTime1(delta+1)-arriveTime1(delta)>0.25
                list2 = [list2 delta+1];
            end
        end
        % judge the list 2
        if isempty(list2)
            list1
            complement = arriveTime1(list1(1))
            chirpNum2
        end
        
    end
end


%% grid searching
% anchor position



%% toaEstimation
% enabling bandpass

% estimation within bandpass

% range

% historical path assist-judgement


