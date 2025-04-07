import removeimage from '../assets/minus-circle.png';

function TableRows({rowsData, deleteTableRows, handleChange}) {
    return(
        
        rowsData.map((data, index)=>{
            const {fullName, emailAddress, salary, datat}= data;
            return(
                <tr key={index}>
                <td>
                <select  className="form-select form-select-sm"  name="fullName" aria-label=".form-select-sm example"
            value={fullName}
            onChange={(evnt)=>(handleChange(index, evnt))}
        >
           <option value="select">-- Select --</option>
           <option value="shared-drive">Shared Drive</option>
           <option value="thredds-url">Thredds</option>
           <option value="geoserver-url">Geoserver</option>
           <option value="api">API</option>
           <option value="other">other</option>
        </select>
                </td>
                <td><input type="text" placeholder="Enter full path" value={emailAddress}  onChange={(evnt)=>(handleChange(index, evnt))} name="emailAddress" className="form-control form-select-sm"/> </td>
                <td>
                <img src={removeimage} alt='logo' style={{width:"18px", height:"18px"}} onClick={()=>(deleteTableRows(index))}/>
                </td>
            </tr>
            )
        })
   
    )
    
}
export default TableRows;