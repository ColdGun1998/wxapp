function y = doFilter1719(x)
%DOFILTER Filters input x and returns output y.

% MATLAB Code
% Generated by MATLAB(R) 9.7 and DSP System Toolbox 9.9.
% Generated on: 04-Jan-2022 21:32:18

%#codegen

% To generate C/C++ code from this function use the codegen command.
% Type 'help codegen' for more information.

persistent Hd;

if isempty(Hd)
    
    % The following code was used to design the filter coefficients:
    %
    % Fstop1 = 17200;  % First Stopband Frequency
    % Fpass1 = 17300;  % First Passband Frequency
    % Fpass2 = 18700;  % Second Passband Frequency
    % Fstop2 = 18800;  % Second Stopband Frequency
    % Astop1 = 60;     % First Stopband Attenuation (dB)
    % Apass  = 1;      % Passband Ripple (dB)
    % Astop2 = 80;     % Second Stopband Attenuation (dB)
    % Fs     = 48000;  % Sampling Frequency
    %
    % h = fdesign.bandpass('fst1,fp1,fp2,fst2,ast1,ap,ast2', Fstop1, Fpass1, ...
    %                      Fpass2, Fstop2, Astop1, Apass, Astop2, Fs);
    %
    % Hd = design(h, 'cheby1', ...
    %     'MatchExactly', 'passband', ...
    %     'SystemObject', true);
    
    Hd = dsp.BiquadFilter( ...
        'Structure', 'Direct form II', ...
        'SOSMatrix', [1 0 -1 1 1.27830616379108 0.998988633309972; 1 0 -1 1 ...
        1.53698504870768 0.999158708571769; 1 0 -1 1 1.28043633611711 ...
        0.996995945442378; 1 0 -1 1 1.53333701370122 0.997490519301226; 1 0 -1 1 ...
        1.28590550934578 0.995087179806038; 1 0 -1 1 1.52737916357163 ...
        0.995862217777829; 1 0 -1 1 1.29452405621526 0.993312313019626; 1 0 -1 1 ...
        1.51917714829868 0.994299417114357; 1 0 -1 1 1.30600796575954 ...
        0.991716879219603; 1 0 -1 1 1.50882243486604 0.992829012301014; 1 0 -1 1 ...
        1.31999277417707 0.990340485264207; 1 0 -1 1 1.49643796936174 ...
        0.991479340261032; 1 0 -1 1 1.33605071991766 0.98921547307226; 1 0 -1 1 ...
        1.48218460306815 0.990279960166977; 1 0 -1 1 1.35371012094871 ...
        0.988365828110442; 1 0 -1 1 1.46626746113367 0.989261005372763; 1 0 -1 1 ...
        1.37247576827645 0.987806450468143; 1 0 -1 1 1.44894129932184 ...
        0.98845210890186; 1 0 -1 1 1.39184899749297 0.987542895777922; 1 0 -1 1 ...
        1.43051383515971 0.987880965286634; 1 0 -1 1 1.41134609338238 ...
        0.987571653527462], ...
        'ScaleValues', [0.0914159940780209; 0.0914159940780209; ...
        0.0893181440684514; 0.0893181440684514; 0.0852567301688606; ...
        0.0852567301688606; 0.079322718650088; 0.079322718650088; ...
        0.0716477239069245; 0.0716477239069245; 0.0624033140090751; ...
        0.0624033140090751; 0.0518012259881898; 0.0518012259881898; ...
        0.0400979783902572; 0.0400979783902572; 0.0276214951643547; ...
        0.0276214951643547; 0.0149611594787419; 0.0149611594787419; ...
        0.00621417323626913; 1]);
end

s = double(x);
y = step(Hd,s);

