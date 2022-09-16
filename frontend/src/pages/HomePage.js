import React, {useState, useEffect, useContext,CSSProperties } from 'react'
import AuthContext from '../context/AuthContext'
import CustomTable from '../components/Table'
import { useCSVDownloader,useCSVReader,
    lightenDarkenColor,
    formatFileSize, } from 'react-papaparse';

// Allowed extensions for input file
const allowedExtensions = ["csv"];

const GREY = '#CCC';
const GREY_LIGHT = 'rgba(255, 255, 255, 0.4)';
const DEFAULT_REMOVE_HOVER_COLOR = '#A01919';
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40
);
const GREY_DIM = '#686868';

const styles = {
  zone: {
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: GREY,
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    padding: 20,
  },
  file: {
    background: 'linear-gradient(to bottom, #EEE, #DDD)',
    borderRadius: 20,
    display: 'flex',
    height: 120,
    width: 120,
    position: 'relative',
    zIndex: 10,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  info: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 10,
    paddingRight: 10,
  },
  size: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    marginBottom: '0.5em',
    justifyContent: 'center',
    display: 'flex',
  },
  name: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    fontSize: 12,
    marginBottom: '0.5em',
  },
  progressBar: {
    bottom: 14,
    position: 'absolute',
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  zoneHover: {
    borderColor: GREY_DIM,
  },
  default: {
    borderColor: GREY,
  } ,
  remove: {
    height: 23,
    position: 'absolute',
    right: 6,
    top: 6,
    width: 23,
  } ,
};



const HomePage = () => {
    const { CSVReader } = useCSVReader();
    const [zoneHover, setZoneHover] = useState(false);
    const [removeHoverColor, setRemoveHoverColor] = useState(
      DEFAULT_REMOVE_HOVER_COLOR
    );
    const createData = (email, valid) => {
        return { email, valid };
      }

    
    const [rows, setRows] = useState([]);
    const [valids, setValids] = useState([]);
    const [nonvalids, setNonvalids] = useState([]);

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
    const handleParse = (results ) => {
         
        // If user clicks the parse button without
        // a file we show a error
        // if (!file) return setError("Enter a valid file");
 
        // Initialize a reader which allows user
        // to read any file or blob.
        // const reader = new FileReader();
         
        // Event listener on reader when the file
        // loads, we parse it and set the data.
        // reader.onload = async ({ target }) => {
            // let emails = [];
            // const csv = Papa.parse(target.result, { header: true });
            // const parsedData = csv?.data;
            // //parsedData.forEach(element => console.log(Object.values(element)[0].split(';')));
            // const columns = Object.keys(parsedData[0])[0].split(';');
            // //console.log(columns);
            // emails = emails.concat(columns)

            // parsedData.forEach(element => emails = emails.concat(Object.values(element)[0].split(';')));
            //console.log(parsedData[2]);
            //console.log(emails)
            let emails = [];
            console.log('---------------------------');
            console.log(results['data']);
            results['data'].forEach(elem => emails=emails.concat(elem));
            console.log('console log mailss' ,emails);
            console.log('---------------------------');

            emails.forEach(
                async (email)=>{
                    let response = await fetch('http://127.0.0.1:8000/api/verify_email/', {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json',
                        'Authorization':'Bearer ' + String(authTokens.access)
                        },
                    body:JSON.stringify({'email':email})

                    })
                    let data = await response.json();
                    setRows(rows => [...rows, createData(email,  data['valid'] ? "Valid" : "non Valid ")]);
                    if (data['valid']){
                        setValids(valids => [...valids, {email}]);
                    }else{
                        setNonvalids(nonvalids => [...nonvalids, {email}]);
                    }


                }
            )
            //console.log(rowsintab);
            
            setData(emails);
        // };
        // reader.readAsText(file);
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

            <div>

            <CSVReader
      onUploadAccepted={(results) => {

        handleParse(results);
        setZoneHover(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setZoneHover(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setZoneHover(false);
      }}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
        Remove,
      }) => (
        <>
          <div
            {...getRootProps()}
            style={Object.assign(
              {},
              styles.zone,
              zoneHover && styles.zoneHover
            )}
          >
            {acceptedFile ? (
              <>
                <div style={styles.file}>
                  <div style={styles.info}>
                    <span style={styles.size}>
                      {formatFileSize(acceptedFile.size)}
                    </span>
                    <span style={styles.name}>{acceptedFile.name}</span>
                  </div>
                  <div style={styles.progressBar}>
                    <ProgressBar />
                  </div>
                  <div
                    {...getRemoveFileProps()}
                    style={styles.remove}
                    onMouseOver={(event) => {
                      event.preventDefault();
                      setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                    }}
                    onMouseOut={(event) => {
                      event.preventDefault();
                      setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                    }}
                  >
                    <Remove color={removeHoverColor} />
                  </div>
                </div>
              </>
            ) : (
              'Drop CSV file here or click to upload'
            )}
          </div>
        </>
      )}
    </CSVReader>






            </div>





{rows.length > 0 ? <CustomTable rows={rows} /> : ''}

{valids.length > 0 ? <CSVDownloader
      type={Type.Button}
      filename={'valid_emails'}
      bom={true}
      config={{
        delimiter: ';',
      }}
      data={valids}
    >
      Download valid
    </CSVDownloader> : ''}

    {nonvalids.length > 0 ? <CSVDownloader
      type={Type.Button}
      filename={'non_valid_emails'}
      bom={true}
      config={{
        delimiter: ';',
      }}
      data={nonvalids}
    >
      Download non valid
    </CSVDownloader> : ''}

{/* <CustomTable rows={rows} /> */}

{/*             
            <CSVDownloader
      type={Type.Button}
      filename={'filename'}
      bom={true}
      config={{
        delimiter: ';',
      }}
      data={rows}
    >
      Download
    </CSVDownloader> */}
        </div>
    )
}

export default HomePage
