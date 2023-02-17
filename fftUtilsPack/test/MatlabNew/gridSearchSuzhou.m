function [xen,yen,Jen] = gridSearchSuzhou(S,Sizeroom,TDOA_value)
TDOA_value = TDOA_value(TDOA_value<0.3);
M = size(S,2);

TDOA_value = TDOA_value-0.15*ones(1,length(TDOA_value));

TDOA_valueseg = zeros(floor(length(TDOA_value)/(M-1)),M-1);
TDOA_value1 = TDOA_value*340;
for positionNum = 1:size(TDOA_valueseg,1)
    TDOA_valueseg(positionNum,:) = TDOA_value1((M-1)*(positionNum-1)+1:(M-1)*positionNum);
end

seq = size(TDOA_valueseg,1);
xen = [];
yen = [];
Jen = [];
for tseq = 1:seq
    J_min = 1e10;
    if tseq == 1
        for x = 0:0.02:Sizeroom(1)
            for y = 0:0.02:Sizeroom(2)
                    dist = sqrt(sum(([x,y]'*ones(1,M)-S).^2))';
                    J = 0;
                    for i_b = 2:M
                       Ji = dist(i_b)-dist(i_b-1)-TDOA_valueseg(tseq,i_b-1);
                       J = J +Ji * Ji;
                    end
                    if J < J_min
                        x_min = x;
                        y_min = y;
                        J_min = J;
                    end
            end
        end
    else
        for x = max(0,(xen(end))):0.02:min((xen(end)+2),Sizeroom(1))
            for y = max(0,(yen(end)-2)):0.02:min((yen(end)+3),Sizeroom(2))
                    dist = sqrt(sum(([x,y]'*ones(1,M)-S).^2))';
                    J = 0;
                    for i_b = 2:M
                       Ji = dist(i_b)-dist(i_b-1)-TDOA_valueseg(tseq,i_b-1);
                       J = J +Ji * Ji;
                    end
                    if J < J_min
                        x_min = x;
                        y_min = y;
                        J_min = J;
                    end
            end
        end
end
    xen = [xen x_min];
    yen = [yen y_min];
    Jen = [Jen J_min];
end
end