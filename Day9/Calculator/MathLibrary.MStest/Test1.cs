using Microsoft.VisualStudio.TestTools.UnitTesting;
//using MathsLibraryAgain;
using Demo_Calculator;
namespace MathLibrary.MStest
{
    [TestClass]
    public sealed class Test1
    {
        private Calculator ? calculator;
        [TestInitialize]
        public void TestInitialize()
        {
            calculator = new Calculator();
        }
        [TestMethod]
        public void TestMethod1()
        {
            // Arrange

            // Act
            int result = calculator.Mulitply(5, 5);
            // Assert
            Assert.AreEqual(25, result);
        }
    }
}
