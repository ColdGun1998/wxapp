function Sfilter = filterChirp(signal,Fpass1,Fpass2,n)
N = 500;
Fs = 48000;
Fstop1 = Fpass1;
Fstop2 = Fpass2;
Fpass1 = Fstop1 + 50;
Fpass2 = Fstop2 - 50;
bpFilt = designfilt('bandpassfir','FilterOrder',N, ...
'StopbandFrequency1',Fstop1,...
'StopbandFrequency2',Fstop2,...
'PassbandFrequency1',Fpass1,...
'PassbandFrequency2',Fpass2,...
'SampleRate',Fs);
if(n)
    fvtool(bpFilt,'Analysis','freq');
end
Sfilter = filter(bpFilt,signal); % Apply low pass filter
end