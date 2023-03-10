import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Autocomplete,
  Chip,
} from "@mui/material";
import CustomerServices from "../../../services/CustomerService";
import axios from "axios";
import { Popup } from "./../../../Components/Popup";
import { CreateAllCompanyDetails } from "./CreateAllCompanyDetails";
import LeadServices from "../../../services/LeadService";
import { CustomLoader } from "../../../Components/CustomLoader";

export const CreateCompanyDetails = (props) => {
  const { setOpenPopup, getAllCompanyDetails } = props;
  const [openPopup2, setOpenPopup2] = useState(false);
  const [open, setOpen] = useState(false);
  const [typeData, setTypeData] = useState("");
  const [category, setCategory] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [inputValue, setInputValue] = useState([]);
  const [pinCodeData, setPinCodeData] = useState([]);
  const [idForEdit, setIdForEdit] = useState("");
  const [assigned, setAssigned] = useState([]);
  const [assign, setAssign] = useState([]);
  const [errorMessage, setErrorMessage] = useState([]);
  const handleChange = (event) => {
    setTypeData(event.target.value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValue({ ...inputValue, [name]: value });
  };

  const validatePinCode = async () => {
    try {
      setOpen(true);
      const PINCODE = inputValue.pin_code;
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${PINCODE}`
      );

      setPinCodeData(response.data[0].PostOffice[0]);
      setOpen(false);
    } catch (error) {
      console.log("Creating Bank error ", error);
      setOpen(false);
    }
  };

  useEffect(() => {
    getLAssignedData();
  }, []);

  const getLAssignedData = async (id) => {
    try {
      setOpen(true);
      const res = await LeadServices.getAllAssignedUser();

      setAssigned(res.data);
      setOpen(false);
    } catch (error) {
      console.log("error", error);
      setOpen(false);
    }
  };
  const GST_NO = (gst_no) => gst_no.length <= 14;
  const createCompanyDetails = async (e) => {
    try {
      e.preventDefault();
      setOpen(true);
      const req = {
        type: typeData,
        name: inputValue.name,
        address: inputValue.address,
        pincode: inputValue.pin_code,
        state: pinCodeData.State,
        city: pinCodeData.District,
        website: inputValue.website_url,
        estd_date: inputValue.estd_date,
        gst_number: inputValue.gst_number,
        pan_number: inputValue.pan_number,
        business_type: businessType,
        category: category,
        assigned_to: assign,
        total_sales_turnover: inputValue.total_sale,
      };
      const response = await CustomerServices.createCompanyData(req);
      setIdForEdit(response.data.company_id);
      // setOpenPopup(false);
      setOpen(false);
      setOpenPopup2(true);
      // getAllCompanyDetails();
    } catch (error) {
      console.log("createing company detail error", error);
      setErrorMessage(
        error.response.data.errors
          ? error.response.data.errors.pan_number
          : error.response.data.errors
      );
      setOpen(false);
    }
  };

  return (
    <div>
      <CustomLoader open={open} />

      <Box
        component="form"
        noValidate
        onSubmit={(e) => createCompanyDetails(e)}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <>
              <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">
                  Type
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  value={typeData}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="Industrial Customer"
                    control={<Radio />}
                    label="Industrial Customer"
                  />
                  <FormControlLabel
                    value="Distribution Customer"
                    control={<Radio />}
                    label="Distribution Customer"
                  />
                </RadioGroup>
              </FormControl>
            </>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="name"
              size="small"
              label="Company Name"
              variant="outlined"
              value={inputValue.name}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="demo-select-small">Busniess Type</InputLabel>
              <Select
                labelId="demo-select-small"
                id="demo-select-small"
                value={businessType}
                label="Busniess Type"
                onChange={(event) => setBusinessType(event.target.value)}
              >
                <MenuItem value={"Proprietor"}>Proprietor </MenuItem>
                <MenuItem value={"Private Limited"}>Private Limited</MenuItem>
                <MenuItem value={"Partnership"}>Partnership</MenuItem>
                <MenuItem value={"Limited"}>Limited</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              sx={{ minWidth: "200px" }}
              name="pin_code"
              size="small"
              type={"number"}
              label="Pin Code"
              variant="outlined"
              value={inputValue.pin_code}
              onChange={handleInputChange}
            />
            <Button
              onClick={() => validatePinCode()}
              variant="contained"
              sx={{ marginLeft: "1rem" }}
            >
              Validate
            </Button>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              name="state"
              label="State"
              variant="outlined"
              value={pinCodeData.State ? pinCodeData.State : ""}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="city"
              size="small"
              label="City"
              variant="outlined"
              value={pinCodeData.District ? pinCodeData.District : ""}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              name="website_url"
              label="website Url"
              variant="outlined"
              value={inputValue.website_url}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              name="estd_date"
              size="small"
              label="Estd.Date"
              variant="outlined"
              value={inputValue.estd_date}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              name="gst_number"
              label="GST No."
              variant="outlined"
              value={inputValue.gst_number}
              onChange={handleInputChange}
              error={GST_NO(
                inputValue.gst_number ? inputValue.gst_number.toString() : ""
              )}
              helperText={
                GST_NO(
                  inputValue.gst_number ? inputValue.gst_number.toString() : ""
                )
                  ? "GST NO should be less than or equal to 15 Digit"
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              size="small"
              name="pan_number"
              label="Pan No."
              variant="outlined"
              value={inputValue.pan_number}
              onChange={handleInputChange}
              error={inputValue.pan_number === ""}
              helperText={errorMessage}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="total_sale"
              size="small"
              type={"number"}
              label="Total Sale"
              variant="outlined"
              value={inputValue.total_sale}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="demo-select-small">Category</InputLabel>
              <Select
                disabled={typeData === "industrial_customer"}
                labelId="demo-select-small"
                id="demo-select-small"
                value={category}
                label="Category"
                onChange={(event) => setCategory(event.target.value)}
              >
                <MenuItem value={"Hardware & Electrical"}>
                  Hardware & Electrical
                </MenuItem>
                <MenuItem value={"Plywood"}>Plywood</MenuItem>
                <MenuItem value={"Plumbing"}>Plumbing</MenuItem>
                <MenuItem value={"Auto Retail"}>Auto Retail</MenuItem>
                <MenuItem value={"Stationary"}>Stationary</MenuItem>
                <MenuItem value={"Others"}>Others</MenuItem>
              </Select>
              <FormHelperText>
                Applicable Only For Distribution Customer
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              size="small"
              value={assign}
              onChange={(event, newValue) => {
                setAssign(newValue);
              }}
              multiple
              limitTags={3}
              id="multiple-limit-tags"
              options={assigned.map((option) => option.email)}
              freeSolo
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign To"
                  placeholder="Assign To"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              multiline
              fullWidth
              name="address"
              size="small"
              label="Address"
              variant="outlined"
              value={inputValue.address}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Submit
        </Button>
      </Box>
      <Popup
        maxWidth={"lg"}
        title={"Create Company Details"}
        openPopup={openPopup2}
        setOpenPopup={setOpenPopup2}
      >
        <CreateAllCompanyDetails
          setOpenPopup={setOpenPopup2}
          getAllCompanyDetails={getAllCompanyDetails}
          recordForEdit={idForEdit}
        />
      </Popup>
    </div>
  );
};
