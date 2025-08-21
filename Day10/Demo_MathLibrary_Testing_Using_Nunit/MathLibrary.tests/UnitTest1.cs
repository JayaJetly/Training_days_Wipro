using NUnit.Framework;
using Demo_MathLibrary_Testing_Using_Nunit;
    namespace MathLibrary.tests

{
    public class Tests
    {
        private Calculator calculator;
        [SetUp]
        public void Setup()
        {
            calculator = new Calculator();
        }

        [Test]
        public void TestAdd()
        {
            //Assert.Pass();
            int result = calculator.Add(7, 2);
            Assert.That(result, Is.EqualTo(9));
        }
        [Test]
        public void Testsubtract()
        {
            int result = calculator.sub(5, 2);
            Assert.That(result, Is.EqualTo(3));
        }
    }
}