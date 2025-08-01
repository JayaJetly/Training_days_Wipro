using System;

class Program
{
    static void Main(string[] args)
    {
        string[] studentNames = new string[5];

        Console.WriteLine("Enter the names of 5 students:");

        for (int i = 0; i < studentNames.Length; i++)
        {
            Console.Write($"Enter name {i + 1}: ");
            studentNames[i] = Console.ReadLine();
        }

        Console.WriteLine("\nStudent Names:");

        foreach (string name in studentNames)
        {
            Console.WriteLine(name);
        }
    }
}
