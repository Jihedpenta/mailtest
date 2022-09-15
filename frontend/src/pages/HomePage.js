import React, {useState, useEffect, useContext} from 'react'
import AuthContext from '../context/AuthContext'
import Papa from "papaparse";

import { useCSVDownloader } from 'react-papaparse';
import AddDeleteTableRows from "../components/Table";

// Allowed extensions for input file
const allowedExtensions = ["csv"];


const HomePage = () => {
    const { CSVDownloader, Type } = useCSVDownloader();

     // This state will store the parsed data
    const [data, setData] = useState([]);
     
    // It state will contain the error when
    // correct file extension is not used
    const [error, setError] = useState("");
     
    // It will store the file uploaded by the user
    const [file, setFile] = useState("");

    const rowsintab = [];

       // This function will be called when
    // the file input changes
    const handleFileChange = (e) => {
        setError("");
         
        // Check if user has entered the file
        if (e.target.files.length) {
            const inputFile = e.target.files[0];
             
            // Check the file extensions, if it not
            // included in the allowed extensions
            // we show the error
            const fileExtension = inputFile?.type.split("/")[1];
            if (!allowedExtensions.includes(fileExtension)) {
                setError("Please input a csv file");
                return;
            }
 
            // If input type is correct set the state
            setFile(inputFile);
        }
    };
    const handleParse = () => {
         
        // If user clicks the parse button without
        // a file we show a error
        if (!file) return setError("Enter a valid file");
 
        // Initialize a reader which allows user
        // to read any file or blob.
        const reader = new FileReader();
         
        // Event listener on reader when the file
        // loads, we parse it and set the data.
        reader.onload = async ({ target }) => {
            let emails = [];
            const csv = Papa.parse(target.result, { header: true });
            const parsedData = csv?.data;
            //parsedData.forEach(element => console.log(Object.values(element)[0].split(';')));
            const columns = Object.keys(parsedData[0])[0].split(';');
            //console.log(columns);
            emails = emails.concat(columns)

            parsedData.forEach(element => emails = emails.concat(Object.values(element)[0].split(';')));
            //console.log(parsedData[2]);
            //console.log(emails)


            emails.forEach(
                async (elem)=>{
                    let response = await fetch('http://127.0.0.1:8000/api/verify_email/', {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json',
                        'Authorization':'Bearer ' + String(authTokens.access)
                        },
                    body:JSON.stringify({'email':elem})

                    })
                    let data = await response.json();
                    rowsintab.push(<p>Email {elem} is {data['valid']}</p>)

                    console.log(data['valid']);
                    console.log(rowsintab.length);

                }
            )
            //console.log(rowsintab);
            
            setData(emails);
        };
        reader.readAsText(file);
    };



    let [notes, setNotes] = useState([])
    let {authTokens, logoutUser} = useContext(AuthContext)




    useEffect(()=> {
        getNotes()
    }, [])


    let getNotes = async() =>{
        let response = await fetch('http://127.0.0.1:8000/api/notes/', {
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })
        let data = await response.json()

        if(response.status === 200){
            setNotes(data)
        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
        
    }

    return (
        <div>
            <p>You are logged to the home page!</p>

            <label htmlFor="csvInput" style={{ display: "block" }}>
                Enter CSV File
            </label>
            <input
                onChange={handleFileChange}
                id="csvInput"
                name="file"
                type="File"
            />
            <div>
                <button onClick={handleParse}>Parse</button>
            </div>
            <div style={{ marginTop: "3rem" }}>
                {/* {error ? error : rowsintab.map((elem) => elem)} */}
{/*                   
                {error ? error : data.map((col,
                  idx) => <div key={idx}>{col}</div>)}
                   */}
            </div>

            <ul>
                {notes.map(note => (
                    <li key={note.id} >{note.body}</li>
                ))}
            </ul>

            <AddDeleteTableRows />

            
            <CSVDownloader
      type={Type.Button}
      filename={'filename'}
      bom={true}
      config={{
        delimiter: ';',
      }}
      data={[
        {
          'Column 1': '1-1',
          'Column 2': '1-2',
          'Column 3': '1-3',
          'Column 4': '1-4',
        },
        {
          'Column 1': '2-1',
          'Column 2': '2-2',
          'Column 3': '2-3',
          'Column 4': '2-4',
        },
        {
          'Column 1': '3-1',
          'Column 2': '3-2',
          'Column 3': '3-3',
          'Column 4': '3-4',
        },
        {
          'Column 1': 4,
          'Column 2': 5,
          'Column 3': 6,
          'Column 4': 7,
        },
      ]}
    >
      Download
    </CSVDownloader>
        </div>
    )
}

export default HomePage
