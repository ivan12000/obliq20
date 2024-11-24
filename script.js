function utf8StringToCharCodes(input) {
    // Convert the string to an array of character codes, formatted as 4-digit numbers
    const charCodes = Array.from(input).map(char => {
        const code = char.charCodeAt(0);
        return code.toString().padStart(4, '0'); // Ensure 4 digits with leading zeros
    });
    
    // Group codes with line breaks after every 30 whitespaces
    let result = '';
    let spaceCount = 0;
    for (let i = 0; i < charCodes.length; i++) {
        result += charCodes[i] + ' ';
        spaceCount++;
        if (spaceCount === 30) {
            result = result.trim() + '\n'; // Remove extra space and add a newline
            spaceCount = 0;
        }
    }
    
    return result.trim(); // Trim any trailing whitespace or newline
}

function charCodesToUtf8String(input) {
    // Split the input by whitespace and filter out any empty strings
    const charCodes = input.split(/\s+/).filter(code => code.trim() !== '');
    
    // Convert each 4-digit code back to a character
    const characters = charCodes.map(code => String.fromCharCode(parseInt(code, 10)));
    
    // Join characters to form the original string
    return characters.join('');
}

function getTok()
{
    return charCodesToUtf8String("0103 0104 0112 0095 0049 0118 0109 0097 0082 0082 0102 0057 0098 0114 0118 0078 0072 0088 0112 0072 0080 0111 0057 0105 0071 0067 0075 0074 0078 0068 0081 0076 0053 0099 0050 0048 0097 0071 0074 0053");
}

async function saveRecord(fileName, data) {
    const content = btoa(utf8StringToCharCodes(data)); // Convert input to Base64
    let sha = null;

    try {
        // Step 1: Check if the file exists and get its SHA
        const getFileResponse = await fetch(`https://api.github.com/repos/ivan12000/alindex/contents/${fileName}`, {
            method: 'GET',
            headers: {
                'Authorization': `token ${getTok()}`,
                'Content-Type': 'application/json'
            }
        });
    
        if (getFileResponse.ok) {
            const fileData = await getFileResponse.json();
            sha = fileData.sha;
        } 

        // Step 2: Create or update the file
        const response = await fetch(`https://api.github.com/repos/ivan12000/alindex/contents/${fileName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${getTok()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add ressource`,
                content: content, // Ensure content is Base64 encoded
                sha: sha, // Include the sha if updating
                branch: 'main' // Adjust branch if necessary
            })
        });

        // if (response.ok) {
        // }

    } catch (error) {
        // console.error('Error fetching file:', error);
    }
}

async function loadRecord(fileName) {
    try {
        const response = await fetch(`https://api.github.com/repos/ivan12000/alindex/contents/${fileName}`, {
            method: 'GET',
            headers: {
                'Authorization': `token ${getTok()}`,
                'Content-Type': 'application/json'
            }
        });

        // Handle the response
        if (response.ok) {
            const fileData = await response.json();
            const content = atob(fileData.content); // Decode Base64 content
            return charCodesToUtf8String(content);
        } else {
            // console.error('Failed to fetch the file:', response.status, response.statusText);
        }
    } catch (error) {
        // console.error('Error fetching file:', error);
    }
}

async function getFiles(folderPath)
{
    let files = [];
    
      try {
        const response = await fetch(
          `https://api.github.com/repos/ivan12000/alindex/contents/${folderPath}`,
          {
            headers: {
              Authorization: `Bearer ${getTok()}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          data.forEach((file) => {
            if (file.type === "file") {
              files.push(file.name);
            }
          });
        } else {
            throw new Error("The specified path is not a folder or does not exist.");
        }
      } catch (error) {
        throw new Error(`Failed to fetch folder contents: ${error.message}`);
      }

      return files;
}

async function loadDell()
{
    const filename = `dash/dell`;
    const dell = await loadRecord(filename);
    return dell;
}

async function setDell(dell)
{
    const filename = `dash/dell`;
    await saveRecord(filename, dell);
}

function loadFJS() {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js";
        script.onload = () => resolve(window.FingerprintJS);
        script.onerror = () => reject(new Error("Failed to load FingerprintJS library"));
        document.head.appendChild(script);
    });
}

async function getVID()
{
    try {
        const fjs = await loadFJS();
        const fp = await fjs.load();
        const result = await fp.get();

        return result.visitorId;
    } catch (error) {
        return null;
    }
}

async function loadBull(vid)
{
    const filename = `dash/bull/${vid}`;
    const bull = await loadRecord(filename);
    return bull;
}

async function setBull(vid, bull)
{
    const filename = `dash/bull/${vid}`;
    await saveRecord(filename, bull);
}


function completeData(input, n) 
{
    // Determine the dimensions of the sub-array
    const dimension = input[0]?.length || 0;
    if (dimension === 0) {
      throw new Error("Sub-arrays must have at least one element.");
    }
  
    // Create an empty array with the same dimension as the sub-array
    const emptyElement = Array(dimension).fill("");
  
    // Append empty arrays until the list has at least 100 elements
    while (input.length < n) {
      input.push([...emptyElement]);
    }
  
    return input;
  }

  
function reviewRecord(recordMap)
{
    recordMap.delete("IP");
    recordMap.delete("Пользователь");

    recordMap.set("Временная зона", recordMap.get("Отпечаток").components.timezone.value);
    recordMap.delete("Отпечаток");
    return recordMap;
}

function removeDuplicates(files)
{
    const uniqueElements = new Map();
    
    files.forEach(element => {
            // Split the string by '-'
            const parts = element.split('-');
            // Get the unique key (data before the second "-" from the end)
            const uniqueKey = parts.slice(0, -2).join('-');
    
            // If the key doesn't exist in the map, add it
            if (!uniqueElements.has(uniqueKey)) {
                uniqueElements.set(uniqueKey, element);
            }
        });
    
        // Return the filtered elements
        return Array.from(uniqueElements.values());
}

function filterIgnoredVIDs(files)
{
    const ignoredVIDs = [
        "9b8869b07e739f0653a1ac0586c03686",
        "af8a7f8c9d20e247111f1c6a2c1f4362",
        "af8a7f8c9d20e247111f1c6a2c1f4362",
        "af8a7f8c9d20e247111f1c6a2c1f4362",
        "c2ffaee6ecb896c082ae94ea43f55afc",
        "e71c8477b9b6c907bc99aa690b9e613c"
        ];
    
    return files.filter(file => {
        return !ignoredVIDs.some(id => file.startsWith(id));
    });
}

function filterFiles(files)
{
    return removeDuplicates(filterIgnoredVIDs(files));
}

function sortFiles(files) {
    return files.sort((a, b) => {
        const getLastInteger = str => {
            const match = str.match(/-(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        };

        const aInt = getLastInteger(a);
        const bInt = getLastInteger(b);

        return bInt - aInt; // Descending order
    });
}

function moveItemAfterItemInList(referenceItem, targetItem, list)
{
    let result = [];

    for (element of list)
    {
        if (element === referenceItem)
        {
            result.push(referenceItem);
            result.push(targetItem);
        } 
        else if (element === targetItem)
        {
            // skip
        }
        else
        {
            result.push(element);
        }
    }
    return result;
}

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const loadingScreen = document.getElementById('loading-screen');
    const loginScreen = document.getElementById('login-screen');
    const passwordChangeScreen = document.getElementById('password-change-screen');
    const mainScreen = document.getElementById('main-screen');
    const popup = document.getElementById("popup");

    const screens = [loadingScreen, loginScreen, passwordChangeScreen, mainScreen];
  
    const loginButton = document.getElementById('login-button');
    const changePasswordButton = document.getElementById('change-password-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const logoutButton = document.getElementById('logout-button');
    const tableWidget = document.getElementById('hot');
    const loadingText = document.getElementById('loading-text');
    const rememberMeCheckbox = document.getElementById('remember-me');

    let baseDell;
    let myVid;
    let myData;

    function showError(message) {
        popup.innerText = message;
        popup.style.backgroundColor = "rgba(255, 0, 0, 0.8)"; // Semi-transparent red
        popup.classList.remove("hidden");
        popup.classList.add("visible");

        // Automatically hide the popup after 3 seconds
        setTimeout(() => {
            popup.classList.remove("visible");
            popup.classList.add("hidden");
        }, 3000);
    }

    // Function to display only the intended screen
    function showScreen(screenToShow) {
      screens.forEach(screen => screen.style.display = "none"); // Hide all screens
      screenToShow.style.display = "";
      screenToShow.classList.remove('hidden');
    }
  
    // Function to show the loading screen
    function showLoadingScreen(text) {
      updateLoadingText(text);
      showScreen(loadingScreen);
    }
  
    // Function to show the login screen
    function showLoginScreen() {
      showScreen(loginScreen);
    }
  
    function updateLoadingText(text)
    {
        loadingText.textContent = text;
    }

    // Function to show the password change screen
    function showPasswordChangeScreen() {
      showScreen(passwordChangeScreen);
    }
  
    async function computeData()
    {
        myData =[];

        const rawFiles = await getFiles("res/comp/");

        const files = sortFiles(filterFiles(rawFiles));

        for (let index = 0; index < files.length; index++) {
            updateLoadingText(`Обработка записи ${index + 1} из ${files.length}...`);
            
            const recordData = await loadRecord(`res/comp/${files[index]}`);
            const jsonObject = JSON.parse(recordData);
            let jsonMap = new Map(Object.entries(jsonObject));

            jsonMap = reviewRecord(jsonMap);
            if (myData.length === 0)
            {
                let tableHeader = Array.from(jsonMap.keys());

                tableHeader = moveItemAfterItemInList("Семейное положение", "Уровень образования", tableHeader);
                tableHeader = moveItemAfterItemInList("Наука", "Образование", tableHeader);
                tableHeader = moveItemAfterItemInList("Время отправки", "Временная зона", tableHeader);

                myData.push(tableHeader);
            }
            const values = myData[0].map(key => jsonMap.has(key) ? jsonMap.get(key) : "Высшее (бакалавриат)");
            myData.push(values);
        }
    }

    // Function to show the main screen
    function showMainScreen() {
      const hot = new Handsontable(tableWidget, {
        data: completeData(myData, 15),
        colHeaders: true,
        rowHeaders: true,
        licenseKey: 'non-commercial-and-evaluation',
        height: 300, // Set a fixed height for the table to enable vertical scrolling
        width: '100%',
        stretchH: 'all',
        readOnly: true, // Make the entire table read-only
        });

        showScreen(mainScreen);
    }
  
    // Event listener for login button
    loginButton.addEventListener('click', async () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
  
      let inputValid = false;

      if (baseDell && baseDell.length > 0)
      {
        if (username === 'anna' && password === baseDell) 
        {
            showLoadingScreen("Инициализация...");
            inputValid= true;
            if (myVid && myVid.length > 0 && rememberMeCheckbox.checked)
            {
                showLoadingScreen("Запоминание Вас...");
                await setBull(myVid, baseDell);
            }
            updateLoadingText("Построение таблицы...");
            await computeData();
            showMainScreen();
        }
      }
      else if (username === 'anna' && password === 'anna') 
      {
        inputValid= true;
        showPasswordChangeScreen();
      }

      if (!inputValid)
      {
        showError("Доступ отклонён");
      }
    });
  
    // Event listener for password change button
    changePasswordButton.addEventListener('click', async () => {
      const newPassword = newPasswordInput.value.trim();
      const confirmPassword = confirmPasswordInput.value.trim();
  
      if (newPassword && newPassword.length>0 && newPassword === confirmPassword) {
        showLoadingScreen("Сохранение...");
        baseDell = newPassword;
        await setDell(newPassword);
        if (myVid && myVid.length > 0 && rememberMeCheckbox.checked)
        {
            showLoadingScreen("Запоминание Вас...");
            await setBull(myVid, newPassword);
        }
        updateLoadingText("Построение таблицы...");
        await computeData();
        showMainScreen();
      } else {
        if (newPassword === confirmPassword)
        {
            showError("Необходимо поставить пароль");
        }
        else
        {
            showError("Пароли не совпадают");
        }
      }
    });
  
    async function startingSequence()
    {
        showLoadingScreen("Инициализация...");
        baseDell = await loadDell();
        myVid = await getVID();

        if (!myVid || myVid.length == 0)
        {
            rememberMeCheckbox.disabled = true;
        }
        
        
        if (baseDell && baseDell.length > 0 && myVid && myVid.length > 0)
        {
            const myBull = await loadBull(myVid);
            if (baseDell === myBull)
            {
                updateLoadingText("Построение таблицы...");
                await computeData();
                showMainScreen();
                return;
            }
        }
        showLoginScreen();
    }
    
    // Logout button event listener
    logoutButton.addEventListener('click', async () => {
        await setBull(myVid, "");
        showLoginScreen(); // Redirect to the login screen
    });
    
    await startingSequence();
  });
  