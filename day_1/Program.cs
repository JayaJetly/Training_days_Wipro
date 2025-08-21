using System; //package name--imported the built in package
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

        double sum = (num1 + num2);
        console.WriteLine("Sum of num1 and num2:" + sum);
    }
}   