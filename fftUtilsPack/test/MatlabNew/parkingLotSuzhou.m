clear, clc,close all;
%% implementing multiple bandpass filters
signal = audioread("Recording #154.wav");signal = signal(:,1);signal = signal(48000*0.8:10.8*48000);
signalLength = 0.03*48000;
interval2D = 0.15;
interval1D = 0.3;
extremeLength = 10;
c = 340;
Error2D = interval2D - extremeLength/c;
Error1D = interval1D - extremeLength/c;
%% 17-19kHz
% TOA estimation
originArriveTime1719 = toaEstimationNew(doFilter1719(signal),signalLength,17e3,19e3,1,3);
arriveTime1719 = timeConverse(originArriveTime1719,signalLength);
arriveTime1719 = arriveTime1719+1;
%% 19-21kHz
% TOA estimation
originArriveTime1921 = toaEstimationNew(doFilter1921(signal),signalLength,19e3,21e3,1,3);
arriveTime1921 = timeConverse(originArriveTime1921,signalLength);
arriveTime1921 = arriveTime1921+0.75;
%% 21-23kHz
% TOA estimation
originArriveTime2123 = toaEstimationNew(doFilter2123(signal),signalLength,21e3,23e3,1,3);
arriveTime2123 = timeConverse(originArriveTime2123,signalLength);

%% grid searching
% anchor position
for i1 = 1:length(arriveTime1719)-1
    if arriveTime1719(i1+1)-arriveTime1719(i1)>0.2
        break;
    end
end
arriveTime1719TDOA = arriveTime1719(i1+1:end);
arriveTime1719TDOA = arriveTime1719TDOA(arriveTime1719TDOA<17);
arriveTime1719TDOA(29) = 9.169;
%% 17-19
x1 = [0 0 5.847 5.847];y1 = [0 15.2 15.2 0];
S = [x1;y1];
Sizeroom = [6 15 2];
% N = size(S,1);
TDOA_value1719 = diff(arriveTime1719TDOA);
[x1719,y1719,J1719] = gridSearchSuzhou(S,Sizeroom,TDOA_value1719);
%% 19-21
for i2 = 1:length(arriveTime1921)-1
    if arriveTime1921(i2+1)-arriveTime1921(i2)>0.2
        break;
    end
end

% arriveTime1921TDOA = arriveTime1921(i2+1:end);
arriveTime1921TDOA = arriveTime1921;
% arriveTime1921TDOA = arriveTime1921TDOA(arriveTime1921TDOA>16);
x2 = [0 6.164 6.164 6.164 0] ;y2 = [0 0 6.375 10.926 10.923];
S1 = [x2;y2];
% N = size(S,1);
TDOA_value1921 = diff(arriveTime1921TDOA);
[x1921,y1921,J1921] = gridSearchSuzhou(S1,Sizeroom,TDOA_value1921);
scatter(x1921,y1921,'k*','LineWidth',2)
hold on;
plot(x2,y2,'r^','LineWidth',2)
% x = [x1719 x1921];
% y = [y1719 y1921];
axis([0 8 0 20])
hold off;
%% two solutions: toaestimation enhancement
%% positionList