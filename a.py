import math
a = 2
b = 8
N = 10
def f(x):
    if math.sqrt(3 * x**2 + 2) <= 0:
        return None
    return 1 / (math.sqrt(3 * (x**2) + 2))

def trap(n):
    h = (b - a) / n
    sum1 = 0
    for i in range(1, n):
        sum1+= (f(i * h) + f((i - 1) * h)) / 2
    return round(sum1 * h / 2, 3)
print(trap(N))