using System; 
namespace CalculatorOperations;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Welcome here!");
        

        Console.WriteLine("Enter first number: ");
        double num1 = Convert.ToDouble(Console.ReadLine());

        Console.WriteLine("Enter second number: ");
        double num2 = Convert.ToDouble(Console.ReadLine());

        double add = (num1 + num2);
        double subtract = (num1 - num2);
        double divide = (num1 / num2);
        double remainder = (num1 % num2);

        Console.WriteLine("num1+num2 = " + add);
        Console.WriteLine("num1-num2 = " + subtract);
        Console.WriteLine("num1/num2 = " + divide);
        Console.WriteLine("num1%num2 = " + remainder);
    }
}    