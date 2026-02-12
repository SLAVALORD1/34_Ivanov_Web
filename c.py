from random import randint 
mas = [] 
N = 30
for i in range(N):
    mas.append(randint(-5, 30))
print(mas)
for i in range(N - 1):
    min_ind = i 
    for j in range(i + 1, N):
        if mas[min_ind] > mas[j]:
            min_ind = j
    mas[i], mas[min_ind] = mas[min_ind], mas[i]
print(mas)
    