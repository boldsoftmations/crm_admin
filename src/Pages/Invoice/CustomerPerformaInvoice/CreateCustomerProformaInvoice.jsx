import {
  Autocomplete,
  // Backdrop,
  Box,
  Button,
  Checkbox,
  // CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import React, { useState, useEffect } from "react";
import InvoiceServices from "../../../services/InvoiceService";
import ProductService from "../../../services/ProductService";
import { Popup } from "./../../../Components/Popup";
import CustomerServices from "../../../services/CustomerService";
import { UpdateCompanyDetails } from "../../Cutomers/CompanyDetails/UpdateCompanyDetails";
import { useSelector } from "react-redux";
import { CustomLoader } from "../../../Components/CustomLoader";
import { ErrorMessage } from "./../../../Components/ErrorMessage/ErrorMessage";
import { useNavigate } from "react-router-dom";

const Root = styled("div")(({ theme }) => ({
  width: "100%",
  ...theme.typography.body2,
  "& > :not(style) + :not(style)": {
    marginTop: theme.spacing(2),
  },
}));

const tfStyle = {
  "& .MuiButtonBase-root.MuiAutocomplete-clearIndicator": {
    color: "blue",
    visibility: "visible",
  },
};

const values = {
  someDate: new Date().toISOString().substring(0, 10),
};

export const CreateCustomerProformaInvoice = (props) => {
  const { setOpenPopup, CustomerData } = props;
  const navigate = useNavigate();
  const [openPopup2, setOpenPopup2] = useState(false);
  const [openPopup3, setOpenPopup3] = useState(false);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState([]);
  const [selectedSellerData, setSelectedSellerData] = useState("");
  const [product, setProduct] = useState([]);
  const [paymentTermData, setPaymentTermData] = useState([]);
  const [deliveryTermData, setDeliveryTermData] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [contactOptions, setContactOptions] = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [companyData, setCompanyData] = useState([]);
  const [contactData, setContactData] = useState([]);
  const [warehouseData, setWarehouseData] = useState([]);
  const [idForEdit, setIDForEdit] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [validationPrice, setValidationPrice] = useState("");
  const [checked, setChecked] = useState(true);
  const [productData, setProductData] = useState();
  const [unit, setUnit] = useState("");
  const [products, setProducts] = useState([
    {
      product: "",
      quantity: "",
      rate: "",
      requested_date: values.someDate,
      special_instructions: "",
    },
  ]);
  const data = useSelector((state) => state.auth);
  const users = data.profile;
  const sellerData = data.sellerAccount;
  // let ContactOptions = companyData
  //   ? companyData.contacts
  //   : "Please Select First Company";

  // let AddressOption = companyData
  //   ? companyData.warehouse
  //   : "Please Select First Company";

  const handleFormChange = (index, event) => {
    setProductData(event.target.textContent);
    let data = [...products];
    data[index][event.target.name ? event.target.name : "product"] = event
      .target.value
      ? event.target.value
      : event.target.textContent;
    setProducts(data);
  };

  function searchUnit(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].product === nameKey) {
        return myArray[i].id;
      }
    }
  }

  const ID = searchUnit(productData, product);

  const addFields = () => {
    let newfield = {
      product: "",
      quantity: "",
      rate: "",
      requested_date: values.someDate,
      special_instructions: "",
    };
    setProducts([...products, newfield]);
  };

  const removeFields = (index) => {
    let data = [...products];
    data.splice(index, 1);
    setProducts(data);
  };

  useEffect(() => {
    getAllCompanyDetails();
  }, [openPopup3]);

  const getAllCompanyDetails = async () => {
    try {
      setOpen(true);
      let response = await CustomerServices.getAllPaginateCompanyData("all");
      setCompanyOptions(response.data);
      setOpen(false);
    } catch (err) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (companyData) getAllCompanyDetailsByID();
  }, [companyData]);

  const getAllCompanyDetailsByID = async () => {
    try {
      setOpen(true);
      const ID = CustomerData.id;
      if (ID) {
        const response = await CustomerServices.getCompanyDataById(ID);
        setContactOptions(response.data.contacts);
        setWarehouseOptions(response.data.warehouse);
        setOpen(false);
      }
    } catch (err) {
      setOpen(false);
      console.log("company data by id error", err);
    }
  };

  useEffect(() => {
    getProduct();
  }, []);

  const getProduct = async () => {
    try {
      setOpen(true);
      const res = await ProductService.getAllValidPriceList("all");
      setProduct(res.data);
      setOpen(false);
    } catch (err) {
      console.error("error potential", err);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (ID) getPriceListData(ID);
  }, [ID]);

  const getPriceListData = async () => {
    try {
      const response = await ProductService.getPriceListById(ID);
      setUnit(response.data.unit);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputValue({ ...inputValue, [name]: value });
  };

  const createCustomerProformaInvoiceDetails = async (e) => {
    try {
      e.preventDefault();
      const req = {
        type: "Customer",
        raised_by: users.email,
        seller_account: selectedSellerData.gst_number,
        company: CustomerData.name,
        contact: contactData.contact,
        alternate_contact: contactData.alternate_contact,
        address: warehouseData.address,
        pincode: warehouseData.pincode,
        state: warehouseData.state,
        city: warehouseData.city,
        place_of_supply: inputValue.place_of_supply,
        transporter_name: inputValue.transporter_name,
        buyer_order_no: checked === true ? "verbal" : inputValue.buyer_order_no,
        buyer_order_date: inputValue.buyer_order_date,
        payment_terms: paymentTermData,
        delivery_terms: deliveryTermData,
        status: "Pending Approval",
        // amount: Amount,
        products: products,
      };
      setOpen(true);
      if (
        contactData.contact !== null &&
        warehouseData.address !== null &&
        warehouseData.state !== null &&
        warehouseData.city !== null &&
        warehouseData.pincode !== null
      ) {
        await InvoiceServices.createCustomerProformaInvoiceData(req);
        setOpenPopup(false);
        navigate("/invoice/performa-invoice");
      } else {
        setIDForEdit(companyData.id);
        setOpenPopup2(true);
      }
      setOpen(false);
    } catch (err) {
      if (err.response.status === 400) {
        setErrorMessage(err.response.data.errors.buyer_order_no);
        setValidationPrice(
          err.response.data.errors.non_field_errors
            ? err.response.data.errors.non_field_errors
            : err.response.data.errors
        );
      }
      // setIDForEdit(leadIDData.lead_id);
      setOpen(false);
      // setOpenPopup2(true);
    }
  };
  console.log("companyData :>> ", companyData);

  const openInPopup = () => {
    setOpenPopup3(true);
    setOpenPopup2(false);
    getAllCompanyDetails();
  };

  return (
    <div>
      <CustomLoader open={open} />
      <Box
        component="form"
        noValidate
        // onSubmit={formik.handleSubmit}
        onSubmit={(e) => createCustomerProformaInvoiceDetails(e)}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              name="seller_account"
              size="small"
              disablePortal
              id="combo-box-demo"
              onChange={(event, value) => setSelectedSellerData(value)}
              options={sellerData}
              getOptionLabel={(option) => option.state}
              sx={{ minWidth: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Seller Account" sx={tfStyle} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              name="payment_terms"
              size="small"
              disablePortal
              id="combo-box-demo"
              onChange={(event, value) => setPaymentTermData(value)}
              options={paymentTermsOptions.map((option) => option.label)}
              getOptionLabel={(option) => option}
              sx={{ minWidth: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Payment Terms" sx={tfStyle} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              name="delivery_terms"
              size="small"
              disablePortal
              id="combo-box-demo"
              onChange={(event, value) => setDeliveryTermData(value)}
              options={deliveryTermsOptions.map((option) => option.label)}
              getOptionLabel={(option) => option}
              sx={{ minWidth: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Delivery Terms" sx={tfStyle} />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Root>
              <Divider>
                <Chip label="CUSTOMER" />
              </Divider>
            </Root>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="company"
              size="small"
              label="Company"
              variant="outlined"
              value={CustomerData.name}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl
              required
              fullWidth
              size="small"
              sx={{ padding: "0", margin: "0" }}
            >
              <InputLabel id="demo-simple-select-required-label">
                Contact Name
              </InputLabel>
              <Select
                labelId="demo-simple-select-required-label"
                id="demo-simple-select-required"
                label="Contact Name"
                onChange={(e, value) => setContactData(e.target.value)}
              >
                {contactOptions &&
                  contactOptions.map((option, i) => (
                    <MenuItem key={i} value={option}>
                      {option ? option.name : "Please First Select Company"}
                    </MenuItem>
                  ))}
              </Select>
              <HelperText>first select Company Name</HelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              disabled
              name="contact"
              size="small"
              label="Contact"
              variant="outlined"
              value={
                contactData
                  ? contactData.contact
                    ? contactData.contact
                    : ""
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              disabled
              name="alternate_contact"
              size="small"
              label="Alt. Contact"
              variant="outlined"
              value={
                contactData
                  ? contactData.alternate_contact
                    ? contactData.alternate_contact
                    : ""
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="demo-simple-select-label">Address</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Address"
                onChange={(e, value) => setWarehouseData(e.target.value)}
              >
                {warehouseOptions &&
                  warehouseOptions.map((option, i) => (
                    <MenuItem key={i} value={option}>
                      {option ? option.address : "Please First Select Contact"}
                    </MenuItem>
                  ))}
              </Select>
              <HelperText>first select Contact</HelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              disabled
              name="city"
              size="small"
              label="City"
              variant="outlined"
              value={
                warehouseData
                  ? warehouseData.city
                    ? warehouseData.city
                    : ""
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              disabled
              name="state"
              size="small"
              label="State"
              variant="outlined"
              value={
                warehouseData
                  ? warehouseData.state
                    ? warehouseData.state
                    : ""
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              disabled
              name="pincode"
              size="small"
              type={"number"}
              label="Pin Code"
              variant="outlined"
              value={
                warehouseData
                  ? warehouseData.pincode
                    ? warehouseData.pincode
                    : ""
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              label="Verbal"
              control={
                <Checkbox
                  checked={checked}
                  onChange={(event) => setChecked(event.target.checked)}
                />
              }
            />

            <TextField
              required
              name="buyer_order_no"
              size="small"
              label="Buyer Order No"
              variant="outlined"
              disabled={checked === true}
              value={
                checked === true
                  ? "Verbal"
                  : inputValue.buyer_order_no
                  ? inputValue.buyer_order_no
                  : ""
              }
              onChange={handleInputChange}
              error={errorMessage}
              helperText={errorMessage}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type={"date"}
              name="buyer_order_date"
              size="small"
              label="Buyer Order Date"
              variant="outlined"
              value={
                inputValue.buyer_order_date
                  ? inputValue.buyer_order_date
                  : values.someDate
              }
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="place_of_supply"
              size="small"
              label="Place of Supply"
              variant="outlined"
              value={inputValue.place_of_supply}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="transporter_name"
              size="small"
              label="Transporter Name"
              variant="outlined"
              value={inputValue.transporter_name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Root>
              <Divider>
                <Chip label="PRODUCT" />
              </Divider>
            </Root>
          </Grid>
          <ErrorMessage errMsg={validationPrice} />
          {products.map((input, index) => {
            return (
              <>
                <Grid key={index} item xs={12} sm={4}>
                  <Autocomplete
                    name="product"
                    size="small"
                    disablePortal
                    id="combo-box-demo"
                    onChange={(event, value) => handleFormChange(index, event)}
                    options={product.map((option) => option.product)}
                    getOptionLabel={(option) => option}
                    sx={{ minWidth: 300 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Product Name"
                        sx={tfStyle}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    name="quantity"
                    size="small"
                    label="Quantity"
                    variant="outlined"
                    value={input.quantity}
                    onChange={(event) => handleFormChange(index, event)}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Unit"
                    variant="outlined"
                    value={unit ? unit : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    type={"number"}
                    fullWidth
                    name="rate"
                    size="small"
                    label="Rate"
                    variant="outlined"
                    // error={validationPrice}
                    // helperText={validationPrice}
                    // value={input.rate}
                    onChange={(event) => handleFormChange(index, event)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type={"number"}
                    name="amount"
                    size="small"
                    label="Amount"
                    variant="outlined"
                    value={(input.quantity * input.rate).toFixed(2)}
                    // onChange={(event) => handleFormChange(index, event)}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    type={"date"}
                    name="requested_date"
                    size="small"
                    label="Request Date"
                    variant="outlined"
                    value={
                      input.requested_date
                        ? input.requested_date
                        : values.someDate
                    }
                    onChange={(event) => handleFormChange(index, event)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    name="special_instructions"
                    size="small"
                    label="Special Instructions"
                    variant="outlined"
                    value={
                      input.special_instructions
                        ? input.special_instructions
                        : ""
                    }
                    onChange={(event) => handleFormChange(index, event)}
                  />
                </Grid>
                <Grid item xs={12} sm={4} alignContent="right">
                  <Button
                    onClick={addFields}
                    variant="contained"
                    sx={{ marginRight: "1em" }}
                  >
                    Add More...
                  </Button>
                  {index !== 0 && (
                    <Button
                      disabled={index === 0}
                      onClick={() => removeFields(index)}
                      variant="contained"
                    >
                      Remove
                    </Button>
                  )}
                </Grid>
              </>
            );
          })}
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
        maxWidth={"xl"}
        title={"Update Lead Details"}
        openPopup={openPopup2}
        setOpenPopup={setOpenPopup2}
      >
        <Typography>
          Kindly update all required field WareHouse Details in Company
        </Typography>
        <Button variant="contained" onClick={() => openInPopup()}>
          Update Company Details
        </Button>
      </Popup>
      <Popup
        maxWidth={"xl"}
        title={"Update Leads"}
        openPopup={openPopup3}
        setOpenPopup={setOpenPopup3}
      >
        <UpdateCompanyDetails
          getAllCompanyDetails={getAllCompanyDetails}
          recordForEdit={idForEdit}
          setOpenPopup={setOpenPopup3}
        />
      </Popup>
    </div>
  );
};

const paymentTermsOptions = [
  { label: "100% Advance", value: "100%_advance" },
  {
    label: "50% Advance, Balance Before Dispatch",
    value: "50%_advance_balance_before_dispatch",
  },
  {
    label: "30% Advance, Balance Before Dispatch",
    value: "30%_advance_balance_before_dispatch",
  },
  { label: "15 days along with PDC", value: "15_days_with_pdc" },
  { label: "30 days along with PDC", value: "30_days_with_pdc" },
  { label: "45 days along with PDC", value: "45_days_with_pdc" },
  { label: "60 days along with PDC", value: "60_days_with_pdc" },
  { label: "7 days", value: "7_days" },
  { label: "15 days", value: "15_days" },
  { label: "30 days", value: "30_days" },
  {
    label: "10% Advance, balance against shipping document (export)",
    value: "10%_advance_balance_against_shipping_document_(export)",
  },
  {
    label: "20% Advance, balance against shipping document (export)",
    value: "20%_advance_balance_against_shipping_document_(export)",
  },
  {
    label: "30% Advance, balance against shipping document (export)",
    value: "30%_advance_balance_against_shipping_document_(export)",
  },
  {
    label: "40% Advance, balance against shipping document (export)",
    value: "40%_advance_balance_against_shipping_document_(export)",
  },
  {
    label: "50% Advance, balance against shipping document (export)",
    value: "50%_advance_balance_against_shipping_document_(export)",
  },
  { label: "LC at Sight (Export)", value: "lc_at_sight_(export)" },
  { label: "LC 45 days (Export)", value: "lc_45_days_(export)" },
  { label: "TT in advance (Export)", value: "tt_in_advance_(export)" },
  { label: "45 days", value: "45_days" },
  { label: "60 days", value: "60_days" },
  { label: "Against Delivery", value: "against_delivery" },
  {
    label: "Transporter Warehouse (Prepaid)",
    value: "transporter_warehouse_(prepaid)",
  },
  {
    label: "Customer Door Delivery (Prepaid)",
    value: "customer_door_delivery_(prepaid)",
  },
];

const deliveryTermsOptions = [
  {
    label: "Ex-Work (Freight to pay)",
    value: "ex_work_(freight_to_pay)",
  },
  {
    label: "Transporter Warehouse (Freight to Pay)",
    value: "transporter_warehouse_(freight_to_pay)",
  },
  {
    label: "Customer Door Delivery (Freight to Pay)",
    value: "customer_door_delivery_(freight_to_pay)",
  },
  {
    label: "Customer Door Delivery (Prepaid)",
    value: "customer_door_delivery_(prepaid)",
  },
  {
    label: "Transporter Warehouse (Prepaid)",
    value: "transporter_warehouse_(prepaid)",
  },
  {
    label: "Add actual freight in invoice",
    value: "add_actual_freight_in_invoice",
  },
  {
    label: "Courier (Freight to Pay)",
    value: "courier_(freight_to_pay)",
  },
  {
    label: "Courier (Freight Add in Invoice)",
    value: "courier_(freight_add_in_invoice",
  },
];

const HelperText = styled(FormHelperText)(() => ({
  padding: "0px",
}));
