// Функція для розрахунку коефіцієнту корисного використання простору
function calculateSpaceUtilization(rectangles, containerSize) {
  // Обчислення загальної площі прямокутників
  const totalBlockArea = rectangles.reduce(
    (total, rect) => total + rect.width * rect.height,
    0
  );
  // Обчислення площі контейнера
  const containerArea = containerSize.width * containerSize.height;
  // Повернення коефіцієнту корисного використання простору
  return totalBlockArea / containerArea;
}

// Функція для розміщення прямокутників у контейнері
function placeRectangles(rectangles, containerSize) {
  // Сортування прямокутників за висотою у спадному порядку
  rectangles.sort((a, b) => b.height - a.height);
  // Створення кореневого вузла
  const rootNode = {
    x: 0,
    y: 0,
    width: containerSize.width,
    height: containerSize.height,
  };
  // Масив для зберігання розміщених прямокутників
  const placedRectangles = [];
  // Об'єкт для відстеження використаних розмірів
  const usedSizes = {};

  // Функція для пошуку вільного вузла у дереві
  function findNode(root, width, height) {
    return root.used
      ? findNode(root.right, width, height) ||
          findNode(root.down, width, height)
      : width <= root.width && height <= root.height
      ? root
      : null;
  }

  // Функція для розділення вузла на два підвузли
  function splitNode(node, width, height) {
    node.used = true;
    node.down = {
      x: node.x,
      y: node.y + height,
      width: node.width,
      height: node.height - height,
    };
    node.right = {
      x: node.x + width,
      y: node.y,
      width: node.width - width,
      height,
    };
  }

  // Ітерація по кожному прямокутнику для його розміщення
  for (const rect of rectangles) {
    let node = findNode(rootNode, rect.width, rect.height);

    // Якщо не вдалося знайти вільне місце для прямокутника
    if (!node && rect.width !== rect.height) {
      const rotatedNode = findNode(rootNode, rect.height, rect.width);
      // Якщо можна помістити прямокутник після повороту
      if (rotatedNode) {
        // Зміна розмірів прямокутника після повороту
        [rect.width, rect.height] = [rect.height, rect.width];
        // Встановлення положення та кольору прямокутника
        rect.x = rotatedNode.x;
        rect.y = rotatedNode.y;
        let color =
          usedSizes[`${rect.width}-${rect.height}`] ||
          (usedSizes[`${rect.width}-${rect.height}`] = getRandomColor());
        rect.color = color;
        // Додавання прямокутника до масиву розміщених прямокутників
        placedRectangles.push(rect);
        // Розділення вузла на два підвузли
        splitNode(rotatedNode, rect.width, rect.height);
        continue;
      }
    }

    // Якщо вузол або його повернений варіант знайдений
    if (node || (node = findNode(rootNode, rect.width, rect.height))) {
      const adjacentNode = findNode(rootNode, rect.width, rect.height);
      // Якщо можливо розмістити прямокутник поруч з іншим
      if (adjacentNode && adjacentNode !== node) {
        rect.x = adjacentNode.x;
        rect.y = adjacentNode.y;
        let color =
          usedSizes[`${rect.width}-${rect.height}`] ||
          (usedSizes[`${rect.width}-${rect.height}`] = getRandomColor());
        rect.color = color;
        placedRectangles.push(rect);
        splitNode(adjacentNode, rect.width, rect.height);
      } else {
        rect.x = node.x;
        rect.y = node.y;
        let color =
          usedSizes[`${rect.width}-${rect.height}`] ||
          (usedSizes[`${rect.width}-${rect.height}`] = getRandomColor());
        rect.color = color;
        placedRectangles.push(rect);
        splitNode(node, rect.width, rect.height);
      }
    }
  }

  return placedRectangles;
}

// Функція для створення прямокутника
function createRectangle(x, y, width, height, color, index) {
  const rectangle = document.createElement("div");
  rectangle.classList.add("rectangle");
  rectangle.style.cssText = `width: ${width}px; height: ${height}px; background-color: ${
    color || getRandomColor()
  }; left: ${x}px; top: ${y}px;`;
  rectangle.innerHTML = index.toString();
  return rectangle;
}

// Функція для генерації випадкових кольорів
function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

// Генерація 10 випадкових прямокутників
const rectangles = Array.from({ length: 10 }, () => ({
  width: Math.floor(Math.random() * (150 - 50 + 1)) + 50,
  height: Math.floor(Math.random() * (150 - 50 + 1)) + 50,
}));

// Розмір контейнера
const containerSize = { width: 500, height: 500 };
// Розміщення прямокутників у контейнері
const placedRectangles = placeRectangles(rectangles, containerSize);

const container = document.getElementById("container");

// Додавання прямокутників до контейнера
placedRectangles.forEach((rect, index) => {
  const { x, y, width, height, color } = rect;
  const rectangle = createRectangle(x, y, width, height, color, index);
  container.appendChild(rectangle);
});

// Розрахунок та відображення коефіцієнту корисного використання простору
const utilization = calculateSpaceUtilization(placedRectangles, containerSize);
document.getElementById("fullness").innerHTML += utilization;
